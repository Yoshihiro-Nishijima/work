import { Menu, MenuItem } from "@mui/material";
import {
	DataGridPro,
	type GridColDef,
	type GridFilterModel,
	type GridRenderCellParams,
} from "@mui/x-data-grid-pro";
import { useEffect, useMemo, useRef, useState } from "react";
import {
	ColumnAndFilterToolBar,
	modelStatusRenderer,
	sortToolTipText,
} from "~/components/elements";
import { dateTimeWithSecondsOperators } from "~/components/elements/DataGrid/DateTimeSecondFilterOperator";
import { WithSortableHeaderTooltip } from "~/components/elements/DataGrid/WithSortableHeaderTooltip";
import { DeleteConfirmDialog } from "~/components/elements/DeleteConfirmDialog";
import { DISABLE_VIRTULIZATION } from "~/config";
import { getADCModels } from "~/features/adc/api/getADCModels";
import { useSearchResults } from "~/features/job-manager-info/hooks/useSearchResults";
import { ModelStatus, toSortParam } from "~/features/job-manager-info/types";
import {
	isFilterPending,
	toSQLFilter,
} from "~/features/misc/types/pagingQueryParam";
import { useTrainingQueue } from "~/features/training-mode/hooks/useTrainingQueue";
import { useDataGridColumnOrder } from "~/lib/useDataGridColumnOrder";
import { toLocalDateStr } from "~/utils/formatter";
import { useModelGridState } from "../hooks/useModelGridState";
import { type ModelData, ModelTypeList } from "../types";

const columns: GridColDef[] = [
	{
		field: "status",
		headerName: "Status",
		width: 1,
		type: "singleSelect",
		valueOptions: [
			{ value: ModelStatus.SUCCESS, label: "success" },
			{ value: ModelStatus.ERROR, label: "error" },
			{ value: ModelStatus.CANCEL, label: "cancel" },
		],
		renderHeader: () => "",
		renderCell: (status: GridRenderCellParams) =>
			modelStatusRenderer(status.value),
	},
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
		field: "type",
		headerName: "Model Type",
		width: 115,
		type: "singleSelect",
		valueOptions: [...ModelTypeList],
	},
	{
		field: "modelName",
		headerName: "Model Name",
		width: 128,
		type: "string",
	},
	{
		field: "datasetName",
		headerName: "Dataset Name",
		width: 128,
		type: "string",
	},
	{
		field: "lastModifiedDate",
		headerName: "Last Modified Date",
		width: 150,
		type: "dateTime",
		valueFormatter: ({ value }) => Boolean(value) && toLocalDateStr(value),
		filterOperators: dateTimeWithSecondsOperators({ allowSeconds: false }),
	},
];

export const ModelDataGrid = (): JSX.Element => {
	const {
		pagination: gridPagination,
		setPagination: setGridPagination,
		columnVisibilityModel,
		setColumnVisibilityModel,
		filterModel,
		setFilterModel,
		sort: gridSort,
		setSort: setGridSort,
	} = useModelGridState();

	const {
		total,
		datalist,
		pagination,
		setPagination,
		setSort,
		setFilter,
		searchResultFetchData,
	} = useSearchResults<ModelData>(
		getADCModels,
		60000,
		toSortParam(gridSort),
		gridPagination,
		toSQLFilter(filterModel, columns),
	);
	const { orderedColumns, handleColumnOrderChange } = useDataGridColumnOrder(
		columns,
		"modelDataGrid",
	);
	const tooltipColumns = useMemo(() => {
		return WithSortableHeaderTooltip(orderedColumns);
	}, [orderedColumns]);

	const {
		doDeleteADCModel,
		isDeleted: isADCModelDeleted,
		resetDeleted: resetADCModelDeleted,
	} = useTrainingQueue();
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const selectedModel = useRef<ModelData>();

	const [contextMenu, setContextMenu] = useState<
		| {
				mouseX: number;
				mouseY: number;
		  }
		| undefined
	>(undefined);

	// ------------------------------
	// Pagination関連
	const handlePaginationModelChange = (model: {
		page: number;
		pageSize: number;
	}): void => {
		setGridPagination(model);
		setPagination(model);
	};

	const handleFilterModelChange = (model: GridFilterModel): void => {
		if (!isFilterPending(model)) {
			setPagination({ ...pagination, page: 0 });
		}
		setFilterModel(model);
		setFilter(toSQLFilter(model, columns));
	};

	const handleContextMenu = (event: React.MouseEvent<HTMLDivElement>): void => {
		event.preventDefault();

		selectedModel.current =
			datalist[Number(event.currentTarget.getAttribute("data-rowindex"))];
		setContextMenu(
			contextMenu == null
				? { mouseX: event.clientX - 2, mouseY: event.clientY - 4 }
				: undefined,
		);
	};
	const handleClose = (): void => {
		setContextMenu(undefined);
		selectedModel.current = undefined;
	};

	const handleDelete = (): void => {
		if (!selectedModel.current) return;
		setDeleteDialogOpen(true);
	};

	const handleCancelDelete = (): void => {
		handleClose();
		setDeleteDialogOpen(false);
		selectedModel.current = undefined;
	};

	const handleConfirmDelete = (): void => {
		if (!selectedModel.current?.modelName) {
			handleClose();
			setDeleteDialogOpen(false);
			return;
		}

		// ADCModel削除API実行
		doDeleteADCModel(selectedModel.current.modelName);
		handleClose();
		setDeleteDialogOpen(false);
		selectedModel.current = undefined;
	};

	// ADCModel削除後の処理
	useEffect(() => {
		if (isADCModelDeleted == null) return;
		if (isADCModelDeleted) {
			searchResultFetchData();
		}
		resetADCModelDeleted();
	}, [isADCModelDeleted, searchResultFetchData, resetADCModelDeleted]);

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
				getRowId={(row) => row.modelName}
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
				slotProps={{
					root: {
						onContextMenu: (e) => {
							e.preventDefault();
							handleClose();
						},
					},
				}}
			>
				<MenuItem onClick={handleDelete}>Delete</MenuItem>
			</Menu>
			<DeleteConfirmDialog
				name={selectedModel.current?.modelName}
				isOpen={deleteDialogOpen}
				onConfirmDelete={handleConfirmDelete}
				onCancel={handleCancelDelete}
			/>
		</>
	);
};
