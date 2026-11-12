import { Box, DialogContent, Menu, MenuItem } from "@mui/material";
import {
	DataGridPro,
	type GridColDef,
	type GridFilterItem,
	type GridFilterModel,
	type GridRenderCellParams,
	type GridRowSelectionModel,
	getGridSingleSelectOperators,
} from "@mui/x-data-grid-pro";
import { type MouseEvent, useMemo, useRef, useState } from "react";
import {
	ColumnAndFilterToolBar,
	deleteLockRenderer,
	sortToolTipText,
} from "~/components/elements";
import { ConfirmDialog } from "~/components/elements/ConfirmDialog";
import { dateTimeWithSecondsOperators } from "~/components/elements/DataGrid/DateTimeSecondFilterOperator";
import { WithSortableHeaderTooltip } from "~/components/elements/DataGrid/WithSortableHeaderTooltip";
import {
	convertSizeFilterItem,
	sizeFilterOperators,
} from "~/components/elements/SizeFilterOperator";
import { Toast } from "~/components/elements/Toast";
import { DISABLE_VIRTULIZATION } from "~/config";
import {
	isFilterPending,
	toSQLFilter,
} from "~/features/misc/types/pagingQueryParam";
import { useDataGridColumnOrder } from "~/lib/useDataGridColumnOrder";
import { toLocalDateStr, toSizeStr } from "~/utils/formatter";
import { getToolData } from "../api/getToolData";
import { useDeleteToolData } from "../hooks/useDeleteToolData";
import { useSearchResults } from "../hooks/useSearchResults";
import { useToolDataGridState } from "../hooks/useToolDataGridState";
import type { ToolData } from "../types";
import { toSortParam } from "../types/converter";

const columns: GridColDef[] = [
	{
		field: "isLocked",
		headerName: "Locked",
		width: 1,
		type: "singleSelect",
		valueOptions: [
			{ value: 0, label: "false" },
			{ value: 1, label: "true" },
		],
		filterOperators: getGridSingleSelectOperators().filter(
			(operator) => operator.value === "is",
		),
		renderHeader: () => "",
		renderCell: (isLocked: GridRenderCellParams) =>
			deleteLockRenderer(isLocked.value),
	},
	{
		field: "executionDate",
		headerName: "Execution Date",
		width: 145,
		type: "dateTime",
		valueFormatter: ({ value }) => Boolean(value) && toLocalDateStr(value),
		hideable: false,
		filterOperators: dateTimeWithSecondsOperators({ allowSeconds: false }),
	},
	{ field: "class", headerName: "Class", flex: 1, minWidth: 128 },
	{ field: "idw", headerName: "IDW", flex: 1, minWidth: 128 },
	{ field: "idp", headerName: "IDP", flex: 1, minWidth: 128 },
	{ field: "recipe", headerName: "Recipe", flex: 2, minWidth: 128 },
	{ field: "port", headerName: "Port", width: 70 },
	{ field: "slotNo", headerName: "Slot", width: 70, type: "number" },
	{ field: "lotID", headerName: "Lot ID", flex: 1, minWidth: 128 },
	{ field: "processID", headerName: "Process ID", flex: 1, minWidth: 128 },
	{ field: "operator", headerName: "Operator" },
	{ field: "comment", headerName: "Comment", flex: 1, minWidth: 128 },
	{
		field: "imageNum",
		headerName: "Images",
		flex: 1,
		minWidth: 128,
		type: "number",
	},
	{
		field: "diskSize",
		headerName: "DiskSize",
		flex: 3,
		minWidth: 128,
		valueFormatter: ({ value }) => toSizeStr(value),
		filterOperators: sizeFilterOperators,
	},
	{
		field: "name",
		headerName: "ToolData",
		flex: 1,
		minWidth: 128,
	},
];

export interface ToolDataKey {
	toolName: string;
	rowIndex: number;
}

const TOAST_TOP_MARGIN = 30;

export function ToolDataDataGrid(): JSX.Element {
	const {
		pagination: gridPagination,
		setPagination: setGridPagination,
		columnVisibilityModel,
		setColumnVisibilityModel,
		filterModel,
		setFilterModel,
		sort: gridSort,
		setSort: setGridSort,
	} = useToolDataGridState();

	const {
		total,
		datalist,
		pagination,
		setPagination,
		setSort,
		setFilter,
		searchResultFetchData,
	} = useSearchResults<ToolData>(
		getToolData,
		undefined,
		toSortParam(gridSort),
		gridPagination,
		toSQLFilter(filterModel, columns),
	);
	const { orderedColumns, handleColumnOrderChange } = useDataGridColumnOrder(
		columns,
		"toolDataDataGrid",
	);
	const tooltipColumns = useMemo(() => {
		return WithSortableHeaderTooltip(orderedColumns);
	}, [orderedColumns]);

	// ------------------------------
	// Pagination関連
	const handlePaginationModelChange = (model: {
		page: number;
		pageSize: number;
	}): void => {
		setGridPagination(model);
		setPagination(model);
	};

	// ------------------------------
	// 行選択関連
	const [rowSelectionModel, setRowSelectionModel] =
		useState<GridRowSelectionModel>([]);

	const hadleOnRowSelectinModelChange = (
		model: GridRowSelectionModel,
	): void => {
		if (model.length === 0) {
			setRowSelectionModel([]);
			return;
		}
		setRowSelectionModel(model);
	};

	// ------------------------------
	// コンテキストメニュー関連
	const [contextTarget, setContextTarget] = useState<string[]>([]);
	const isSingleTarget = contextTarget.length === 1;
	const [contextMenu, setContextMenu] = useState<
		| {
				mouseX: number;
				mouseY: number;
		  }
		| undefined
	>(undefined);

	const handleContextMenu = (event: MouseEvent): void => {
		event.preventDefault();
		const { name } =
			datalist[Number(event.currentTarget.getAttribute("data-rowindex"))];

		// 複数選択中のResultが対象か否かでコンテキストメニュー内容を変える
		if (rowSelectionModel.length > 1 && rowSelectionModel.includes(name)) {
			setContextTarget(rowSelectionModel.map(String));
		} else {
			setContextTarget([name]);
		}

		setContextMenu(
			contextMenu == null
				? { mouseX: event.clientX - 2, mouseY: event.clientY - 4 }
				: undefined,
		);
	};

	const handleClose = (): void => {
		setContextMenu(undefined);
	};

	// ------------------------------
	// 削除操作関連
	const { getResultsByToolData, lockToolData, unlockToolData, deleteToolData } =
		useDeleteToolData();

	const isLocked =
		isSingleTarget &&
		datalist
			.filter((row) => row.name === contextTarget[0])
			.every((row) => row.isLocked > 0);

	const [deleteToastOpen, setDeleteToastOpen] = useState(false);
	const [deleteErrorMessage, setDeleteErrorMessage] = useState<
		string | undefined
	>(undefined);
	const toastTrigger = {
		isOpen: deleteToastOpen,
		onClose: () => {
			setDeleteErrorMessage(undefined);
			setDeleteToastOpen(false);
		},
	};

	const [deleteResultDialogOpen, setDeleteResultDialogOpen] = useState(false);
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const [confirmMsg, setConfirmMsg] = useState("");

	const menuPaperRef = useRef<HTMLDivElement>(null);
	const [displayPosition, setDisplayPosition] = useState({
		top: "0px",
		left: "0px",
	});

	// Lock/Unlockメニュー選択時の処理
	const handleClickLock = async (): Promise<void> => {
		handleClose();
		if (contextTarget.length !== 1) return;
		const err = isLocked
			? await unlockToolData(contextTarget[0])
			: await lockToolData(contextTarget[0]);
		if (err) {
			setDeleteErrorMessage(err);
			setDeleteToastOpen(true);
		} else {
			searchResultFetchData();
		}
	};

	// Deleteメニュー選択時の処理
	const handleClickDelete = async (): Promise<void> => {
		if (contextTarget.length === 0) return;
		handleClose();

		// ToolDataがロックされている場合は削除不可(API側でも弾かれるが先に画面で通知)
		const haslockedToolData = datalist
			.filter((row) => contextTarget.includes(row.name))
			.some((row) => row.isLocked > 0);
		if (haslockedToolData) {
			setDeleteErrorMessage(
				"Failed to append the ToolData data to Delete List. \r\n" +
					"Please confirm that the selected ToolData data is not locked.",
			);
			setDeleteToastOpen(true);
			return;
		}

		// ToolDataに紐づくResult一覧を取得
		const results = await getResultsByToolData(contextTarget);
		if (typeof results === "string") {
			setDeleteErrorMessage(results);
			setDeleteToastOpen(true);
			return;
		}

		// results が空の場合はToolDataだけ削除するので確認ダイアログ1をスキップ
		if (results.length === 0) {
			// 削除確認ダイアログ2の表示
			setDeleteDialogOpen(true);
			return;
		}

		// 削除確認ダイアログ1の表示
		const resultsInfo = results
			.map(
				(r) =>
					`- ${toLocalDateStr(r.executionDate)}\t${r.jobType}\t${r.class}\t${r.idw}\t${r.recipe}`,
			)
			.join("\r\n");
		const message = [
			"The following Result Data associated with the Tool Data will be deleted.",
			"Please confirm that you wish to process it.\r\n",
			resultsInfo,
		].join("\r\n");
		setConfirmMsg(message);
		setDeleteResultDialogOpen(true);
	};

	const handleConfirmResultDelete = (): void => {
		setDeleteResultDialogOpen(false);
		setDeleteDialogOpen(true);
	};

	const handleConfirmDelete = async (): Promise<void> => {
		setDeleteDialogOpen(false);
		if (contextTarget.length === 0) return;
		const err = await deleteToolData(contextTarget);
		if (err) {
			setDeleteErrorMessage(err);
			setDeleteToastOpen(true);
			return;
		}
		setDeleteToastOpen(true);
		searchResultFetchData();
	};

	const handleCancelDelete = (): void => {
		setDeleteDialogOpen(false);
	};

	const filterConverterMap: Record<
		string,
		(item: GridFilterItem) => GridFilterItem
	> = {
		diskSize: convertSizeFilterItem,
	};

	const convertFilterModel = (m: GridFilterModel): GridFilterModel => {
		if (!isFilterPending(m)) {
			setPagination({ ...pagination, page: 0 });
		}
		const convertedItems = m.items.map((item) => {
			return filterConverterMap[item.field]?.(item) ?? item;
		});
		return { ...m, items: convertedItems };
	};

	const handleFilterModelChange = (model: GridFilterModel): void => {
		setFilterModel(model);
		setFilter(toSQLFilter(convertFilterModel(model), columns));
	};

	return (
		<>
			<Box
				sx={{
					width: "100%",
					height: "100%",
					display: "flex",
					flexDirection: "column",
				}}
			>
				<DataGridPro
					columns={tooltipColumns}
					rows={datalist}
					slotProps={{
						row: {
							onContextMenu: handleContextMenu,
							style: { cursor: "context-menu" },
						},
					}}
					sx={{ height: "100%", border: 0, flex: 1, minWidth: 0 }}
					columnHeaderHeight={40}
					rowHeight={40}
					slots={{ toolbar: ColumnAndFilterToolBar }}
					localeText={sortToolTipText}
					disableColumnMenu
					hideFooterSelectedRowCount
					disableVirtualization={DISABLE_VIRTULIZATION}
					getRowId={(row) => row.name}
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
					rowSelectionModel={useMemo(
						() => rowSelectionModel,
						[rowSelectionModel],
					)}
					onRowSelectionModelChange={hadleOnRowSelectinModelChange}
				/>{" "}
			</Box>
			<Menu
				open={contextMenu != null}
				onClose={handleClose}
				anchorReference="anchorPosition"
				anchorPosition={
					contextMenu != null
						? { top: contextMenu.mouseY, left: contextMenu.mouseX }
						: undefined
				}
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
				<MenuItem
					onClick={handleClickDelete}
					disabled={isSingleTarget && isLocked}
				>
					Delete
				</MenuItem>
				{isSingleTarget && (
					<MenuItem onClick={() => handleClickLock()}>
						{isLocked ? "Unlock" : "Lock"}
					</MenuItem>
				)}
			</Menu>
			{/* 削除確認ダイアログ1 */}
			<ConfirmDialog
				okLabel="DELETE"
				isOpen={deleteResultDialogOpen}
				onConfirm={handleConfirmResultDelete}
				onCancel={() => setDeleteResultDialogOpen(false)}
				maxWidth="lg"
				dialogContent={
					<DialogContent sx={{ whiteSpace: "pre-wrap", minWidth: 600 }}>
						{confirmMsg}
					</DialogContent>
				}
			/>
			{/* 削除確認ダイアログ2 */}
			<ConfirmDialog
				okLabel="DELETE"
				isOpen={deleteDialogOpen}
				onConfirm={handleConfirmDelete}
				onCancel={handleCancelDelete}
				dialogContent={
					<DialogContent sx={{ whiteSpace: "pre-wrap" }}>
						{"Most features (e.g. RE-EXECUTE, Integrated Viewer) will no longer be available.\r\n" +
							"Please confirm that you wish to delete it."}
					</DialogContent>
				}
			/>
			<Toast
				message={deleteErrorMessage ?? "Delete succeeded."}
				trigger={toastTrigger}
				anchorOrigin={{ vertical: "top", horizontal: "left" }}
				severity={deleteErrorMessage ? "error" : "success"}
				displayPosition={displayPosition}
			/>{" "}
		</>
	);
}
