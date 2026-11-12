import { Menu, MenuItem } from "@mui/material";
import {
	DataGridPro,
	type GridColDef,
	type GridFilterModel,
} from "@mui/x-data-grid-pro";
import { useEffect, useMemo, useRef, useState } from "react";
import { ColumnAndFilterToolBar, sortToolTipText } from "~/components/elements";
import { dateTimeWithSecondsOperators } from "~/components/elements/DataGrid/DateTimeSecondFilterOperator";
import { WithSortableHeaderTooltip } from "~/components/elements/DataGrid/WithSortableHeaderTooltip";
import { DeleteConfirmDialog } from "~/components/elements/DeleteConfirmDialog";
import { Toast } from "~/components/elements/Toast";
import { DISABLE_VIRTULIZATION, getADCAnnotationURL } from "~/config";
import { useSearchResults } from "~/features/job-manager-info/hooks/useSearchResults";
import { toSortParam } from "~/features/job-manager-info/types/converter";
import {
	isFilterPending,
	toSQLFilter,
} from "~/features/misc/types/pagingQueryParam";
import { useDataGridColumnOrder } from "~/lib/useDataGridColumnOrder";
import { toLocalDateStr } from "~/utils/formatter";
import { getDatasets } from "../api/getDatasets";
import { useCopyDataset } from "../hooks/useCopyDataset";
import { useDatasetGridState } from "../hooks/useDatasetGridState";
import { useDeleteDataset } from "../hooks/useDeleteDataset";
import { useSourceList } from "../hooks/useSourceList";
import { type Dataset, DatasetTypeList } from "../types";
import { CopyDatasetDialog } from "./CopyDatasetDialog";

const columns: GridColDef[] = [
	{
		field: "createdDate",
		headerName: "Created Date",
		width: 150,
		type: "dateTime",
		valueFormatter: ({ value }) => Boolean(value) && toLocalDateStr(value),
		hideable: false,
		filterOperators: dateTimeWithSecondsOperators({ allowSeconds: false }),
	},
	{
		field: "lastModifiedDate",
		headerName: "Last Modified Date",
		width: 150,
		type: "dateTime",
		valueFormatter: ({ value }) => Boolean(value) && toLocalDateStr(value),
		filterOperators: dateTimeWithSecondsOperators({ allowSeconds: false }),
	},
	{
		field: "datasetName",
		headerName: "Dataset Name",
		width: 300,
		type: "string",
	},
	{
		field: "datasetType",
		headerName: "Dataset Type",
		width: 115,
		type: "singleSelect",
		valueOptions: [...DatasetTypeList],
	},
];

export const DatasetDataGrid = (): JSX.Element => {
	const {
		pagination: gridPagination,
		setPagination: setGridPagination,
		columnVisibilityModel,
		setColumnVisibilityModel,
		filterModel,
		setFilterModel,
		sort: gridSort,
		setSort: setGridSort,
	} = useDatasetGridState();
	const {
		total,
		datalist,
		pagination,
		setPagination,
		setSort,
		setFilter,
		searchResultFetchData,
	} = useSearchResults<Dataset>(
		getDatasets,
		10000,
		toSortParam(gridSort),
		gridPagination,
		toSQLFilter(filterModel, columns),
	);
	const { orderedColumns, handleColumnOrderChange } = useDataGridColumnOrder(
		columns,
		"datasetDataGrid",
	);
	const tooltipColumns = useMemo(() => {
		return WithSortableHeaderTooltip(orderedColumns);
	}, [orderedColumns]);

	const { addDatasetSource, lastAddStatus, message, lastAddSeq, addable } =
		useSourceList();
	const {
		setSourceDatasetName,
		setDestinationDatasetName,
		setSourceDatasetType,
	} = useCopyDataset();
	const [toastOpen, setToastOpen] = useState(false);
	const { isDeleted, deleteByName, resetDeleted } = useDeleteDataset();
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const [copyDialogOpen, setCopyDialogOpen] = useState(false);
	const selectedDataset = useRef<Dataset | undefined>(undefined);
	// Menu(Popover)のPaper要素の実寸を測るためのref
	const menuPaperRef = useRef<HTMLDivElement>(null);
	const [contextMenu, setContextMenu] = useState<
		| {
				mouseX: number;
				mouseY: number;
		  }
		| undefined
	>(undefined);
	const isADC = selectedDataset.current?.datasetType === "ADC";

	const TOAST_TOP_MARGIN = 30;
	// コンテキストメニューの下あたりにトースト表示（Menu表示完了後に更新）
	const [displayPosition, setDisplayPosition] = useState({
		top: "0px",
		left: "0px",
	});

	const toastTrigger = {
		isOpen: toastOpen,
		onClose: () => setToastOpen(false),
	};

	// ------------------------------
	// Pagination関連
	const handlePaginationModelChange = (model: {
		page: number;
		pageSize: number;
	}): void => {
		setGridPagination(model);
		setPagination(model);
	};

	// lastAddSeq が変わるたびにトーストを開く (同じ status/message が続いても発火させるため)
	useEffect(() => {
		if (lastAddSeq === 0 || !lastAddStatus) return;
		setToastOpen(true);
	}, [lastAddSeq, lastAddStatus]);

	const handleFilterModelChange = (model: GridFilterModel): void => {
		if (!isFilterPending(model)) {
			setPagination({ ...pagination, page: 0 });
		}
		setFilterModel(model);
		setFilter(toSQLFilter(model, columns));
	};

	const handleContextMenu = (event: React.MouseEvent<HTMLDivElement>): void => {
		event.preventDefault();

		selectedDataset.current =
			datalist[Number(event.currentTarget.getAttribute("data-rowindex"))];
		setContextMenu(
			contextMenu == null
				? { mouseX: event.clientX - 2, mouseY: event.clientY - 4 }
				: undefined,
		);
	};
	const handleClose = (): void => {
		setContextMenu(undefined);
		selectedDataset.current = undefined;
	};

	const addToSourceList = (): void => {
		selectedDataset.current != null &&
			addDatasetSource(selectedDataset.current);
		handleClose();
	};

	const openADCAnnotation = (datasetName: string): void => {
		// ADCアノテーション兼モデル作成画面
		window.open(getADCAnnotationURL(datasetName));
		handleClose();
	};

	const handleCopy = async (): Promise<void> => {
		if (!selectedDataset.current) return;

		const ds = selectedDataset.current;

		setSourceDatasetName(ds.datasetName);
		setSourceDatasetType(ds.datasetType);
		setDestinationDatasetName(`${ds.datasetName}_copy`);

		setCopyDialogOpen(true);
	};

	const copyDialogClose = (isCopied: boolean): void => {
		setCopyDialogOpen(false);
		handleClose();
		// 再フェッチ
		if (isCopied) searchResultFetchData();
	};

	const handleDelete = (): void => {
		if (!selectedDataset.current) return;
		setDeleteDialogOpen(true);
	};

	const handleCancelDelete = (): void => {
		handleClose();
		setDeleteDialogOpen(false);
		selectedDataset.current = undefined;
	};

	const handleConfirmDelete = (): void => {
		if (!selectedDataset.current?.datasetName) {
			handleClose();
			setDeleteDialogOpen(false);
			return;
		}

		// Dataset削除API実行
		deleteByName(
			selectedDataset.current.datasetType,
			selectedDataset.current.datasetName,
		);
		handleClose();
		setDeleteDialogOpen(false);
		selectedDataset.current = undefined;
	};

	// Dataset削除後の処理
	useEffect(() => {
		if (isDeleted == null) return;
		if (isDeleted) {
			searchResultFetchData();
		}
		resetDeleted();
	}, [isDeleted, searchResultFetchData, resetDeleted]);

	return (
		<>
			<DataGridPro
				columns={tooltipColumns}
				rows={datalist}
				slotProps={{
					row: {
						onContextMenu: handleContextMenu,
						style: { cursor: "context-menu" },
					},
				}}
				sx={{ height: "100%", border: 0 }}
				columnHeaderHeight={40}
				rowHeight={40}
				slots={{ toolbar: ColumnAndFilterToolBar }}
				localeText={sortToolTipText}
				disableColumnMenu
				disableMultipleRowSelection
				hideFooterSelectedRowCount
				disableVirtualization={DISABLE_VIRTULIZATION}
				getRowId={(row) => row.datasetName}
				// ページ切り替え時にデータfetchする
				paginationMode="server"
				// データ総件数
				rowCount={total}
				pagination
				paginationModel={gridPagination}
				pageSizeOptions={[gridPagination.pageSize]}
				onPaginationModelChange={handlePaginationModelChange}
				// ソート条件指定時
				sortingMode="server"
				sortModel={gridSort}
				onSortModelChange={(sorting) => {
					setGridSort(sorting);
					setSort(toSortParam(sorting));
				}}
				// フィルタ条件指定時
				filterMode="server"
				filterModel={filterModel}
				onFilterModelChange={handleFilterModelChange}
				// カラム表示/非表示
				columnVisibilityModel={columnVisibilityModel}
				onColumnVisibilityModelChange={setColumnVisibilityModel}
				onColumnOrderChange={handleColumnOrderChange}
				isRowSelectable={() => false}
			/>
			<Menu
				open={contextMenu != null}
				onClose={handleClose}
				anchorReference="anchorPosition"
				anchorPosition={
					contextMenu != null
						? { top: contextMenu.mouseY, left: contextMenu.mouseX }
						: undefined
				}
				// Menu（Popover）のトランジション完了後にPaperのサイズを取得してトースト座標を更新
				TransitionProps={{
					onEntered: () => {
						const rect = menuPaperRef.current?.getBoundingClientRect();
						setDisplayPosition({
							top: `${(rect?.top ?? contextMenu?.mouseY ?? 0) + TOAST_TOP_MARGIN}px`,
							left: `${rect?.left ?? contextMenu?.mouseX ?? 0}px`,
						});
					},
				}}
				slotProps={{
					root: {
						onContextMenu: (e) => {
							e.preventDefault();
							handleClose();
						},
					},
					paper: { ref: menuPaperRef },
				}}
			>
				<MenuItem onClick={addToSourceList} disabled={!addable}>
					Add to Source List
				</MenuItem>
				{isADC && (
					<MenuItem
						onClick={() =>
							openADCAnnotation(selectedDataset.current?.datasetName ?? "")
						}
					>
						Edit & Create Model
					</MenuItem>
				)}
				<MenuItem onClick={handleCopy}>Copy</MenuItem>
				<MenuItem onClick={handleDelete}>Delete</MenuItem>
			</Menu>
			<DeleteConfirmDialog
				name={selectedDataset.current?.datasetName}
				isOpen={deleteDialogOpen}
				onConfirmDelete={handleConfirmDelete}
				onCancel={handleCancelDelete}
			/>
			<Toast
				message={message || ""}
				trigger={toastTrigger}
				anchorOrigin={{ vertical: "top", horizontal: "left" }}
				severity={lastAddStatus}
				displayPosition={displayPosition}
			/>
			<CopyDatasetDialog open={copyDialogOpen} onClose={copyDialogClose} />
		</>
	);
};
