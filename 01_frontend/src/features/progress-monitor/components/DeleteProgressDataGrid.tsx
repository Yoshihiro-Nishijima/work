import {
	DataGridPro,
	type GridColDef,
	type GridFilterItem,
	type GridFilterModel,
	type GridRenderCellParams,
	getGridSingleSelectOperators,
} from "@mui/x-data-grid-pro";
import { toLocalDateStr, toNumStr, toTimeStr } from "utils/formatter";

import { Menu, MenuItem } from "@mui/material";
import { type MouseEvent, memo, useEffect, useRef, useState } from "react";
import {
	convertSizeFilterItem,
	deleteStatusRenderer,
	reExecutedRenderer,
	resultStatusRenderer,
	sizeFilterOperators,
} from "~/components/elements";
import { dateTimeWithSecondsOperators } from "~/components/elements/DataGrid/DateTimeSecondFilterOperator";
import { Toast } from "~/components/elements/Toast";
import { DISABLE_VIRTULIZATION } from "~/config";
import {
	convertProcessTimeFilterItem,
	processTimeFilterOperators,
} from "~/features/job-manager-info/components/ProcessTimeFilterOperator";
import { useSearchResults } from "~/features/job-manager-info/hooks/useSearchResults";
import { ResultStatus } from "~/features/job-manager-info/types";
import {
	isFilterPending,
	toSQLFilter,
} from "~/features/misc/types/pagingQueryParam";
import { JobTypeList } from "~/features/recipe/types";
import { useDataGridColumnOrder } from "~/lib/useDataGridColumnOrder";
import { getDeleteProgressList } from "../api/getDeleteProgressList";
import { useDeleteProgressGridState } from "../hooks/useDeleteProgressGridState";
import { useDeleteProgressInfo } from "../hooks/useDeleteProgressInfo";
import { type DeleteProgressInfo, DeleteProgressStatusList } from "../types";
import {
	getDeleteType,
	getDiskSizeOrDefault,
	getErrorOrDefault,
	getJobTypeOrDefault,
	getNameOrDefault,
	getProcessTimeOrDefault,
	getReExecutedForResult,
	getStatusForResult,
} from "./DeleteProgressColumnHelpers";
import { DiskAvailableToolBar } from "./DiskAvailableToolBar";

// DeleteProgressDataGrid専用のツールバーコンポーネント（メモ化して再レンダリングを防止）
const MemoizedDeleteProgressToolBar = memo(() => {
	return <DiskAvailableToolBar />;
});

// ソート無効化ヘルパー (全列一括で sortable:false を付加)
const makeUnsortable = <T extends GridColDef>(cols: T[]): T[] =>
	cols.map((c) => ({ ...c, sortable: false }));

const baseColumns: GridColDef[] = [
	{
		field: "deleteStatus",
		headerName: "Delete Status",
		width: 1,
		align: "center",
		hideable: false,
		type: "singleSelect",
		valueOptions: [...DeleteProgressStatusList],
		renderHeader: () => "",
		renderCell: (status: GridRenderCellParams) =>
			deleteStatusRenderer(status.value),
	},
	{ field: "idx", headerName: "Delete Order", type: "number", hideable: false },
	{
		field: "deleteType",
		headerName: "Delete Type",
		valueGetter: ({ row }) => getDeleteType(row),
		type: "singleSelect",
		valueOptions: [
			{ value: "Result", label: "Result" },
			{ value: "ToolData", label: "ToolData" },
		],
	},
	{
		field: "status",
		headerName: "Status",
		width: 1,
		align: "center",
		type: "singleSelect",
		valueOptions: [
			{ value: ResultStatus.SUCCESS, label: "success" },
			{ value: ResultStatus.ERROR, label: "error" },
			{ value: ResultStatus.WARN, label: "warn" },
		],
		renderHeader: () => "",
		valueGetter: ({ row }) => getStatusForResult(row),
		renderCell: (status: GridRenderCellParams) =>
			status.value >= 0 ? resultStatusRenderer(status.value) : <>-</>,
	},
	{
		field: "executionDate",
		headerName: "Execution Date",
		width: 145,
		type: "dateTime",
		valueFormatter: ({ value }) => Boolean(value) && toLocalDateStr(value),
		filterOperators: dateTimeWithSecondsOperators({ allowSeconds: false }),
	},
	{
		field: "jobType",
		headerName: "Job Type",
		width: 115,
		type: "singleSelect",
		valueGetter: ({ row }) => getJobTypeOrDefault(row),
		valueOptions: [...JobTypeList],
	},
	{
		field: "processTime",
		headerName: "Process Time",
		width: 105,
		valueGetter: ({ row }) => getProcessTimeOrDefault(row),
		valueFormatter: ({ value }) => toTimeStr(value),
		filterOperators: processTimeFilterOperators,
	},
	{
		field: "reExecuted",
		headerName: "Re-executed",
		width: 96,
		type: "singleSelect",
		valueOptions: [
			{ value: 0, label: "false" },
			{ value: 1, label: "true" },
		],
		filterOperators: getGridSingleSelectOperators().filter(
			(operator) => operator.value === "is",
		),
		valueGetter: ({ row }) => getReExecutedForResult(row),
		renderCell: (executed: GridRenderCellParams) =>
			executed.value >= 0 ? reExecutedRenderer(executed.value) : <>-</>,
	},
	{
		field: "imageNum",
		headerName: "Images",
		align: "right",
		width: 82,
		type: "number",
		valueFormatter: ({ value }) => (value == null ? "" : toNumStr(value)),
	},
	{
		field: "diskSize",
		headerName: "DiskSize",
		align: "right",
		width: 82,
		valueGetter: ({ row }) => getDiskSizeOrDefault(row),
		filterOperators: sizeFilterOperators,
	},
	{ field: "class", headerName: "Class", flex: 1, minWidth: 128 },
	{ field: "recipe", headerName: "Recipe", flex: 2, minWidth: 128 },
	{ field: "comment", headerName: "Comment", flex: 1, minWidth: 128 },
	{ field: "idw", headerName: "IDW", flex: 1, minWidth: 128 },
	{ field: "idp", headerName: "IDP", flex: 1, minWidth: 128 },
	{ field: "port", headerName: "Port", align: "center", width: 70 },
	{
		field: "slotNo",
		headerName: "Slot",
		align: "center",
		width: 70,
		type: "number",
	},
	{ field: "lotID", headerName: "Lot ID", flex: 1, minWidth: 128 },
	{ field: "processID", headerName: "Process ID", flex: 1, minWidth: 128 },
	{ field: "operator", headerName: "Operator" },
	{
		field: "name",
		headerName: "ResultName",
		flex: 3,
		minWidth: 128,
		valueGetter: ({ row }) => getNameOrDefault(row),
	},
	{ field: "toolData", headerName: "ToolData", flex: 3, minWidth: 128 },
	{
		field: "error",
		headerName: "Error",
		flex: 3,
		minWidth: 128,
		valueGetter: ({ row }) => getErrorOrDefault(row),
	},
	{ field: "deleteError", headerName: "DeleteError", flex: 3, minWidth: 128 },
];

const columns: GridColDef[] = makeUnsortable(baseColumns);

const filterConverterMap: Record<
	string,
	(item: GridFilterItem) => GridFilterItem
> = {
	processTime: convertProcessTimeFilterItem,
	diskSize: convertSizeFilterItem,
};
const convertFilterModel = (model: GridFilterModel): GridFilterModel => {
	return {
		...model,
		items: model.items.map((item) => {
			return filterConverterMap[item.field]?.(item) ?? item;
		}),
	};
};

const TOAST_TOP_MARGIN = 30;

export function DeleteProgressDataGrid(): JSX.Element {
	const [toastOpen, setToastOpen] = useState(false);
	const [toastMessage, setToastMessage] = useState("");
	const [toastSeverity, setToastSeverity] = useState<"success" | "error">(
		"success",
	);
	// Menu(Popover)のPaper要素の実寸を測るためのref
	const menuPaperRef = useRef<HTMLDivElement>(null);
	const [displayPosition, setDisplayPosition] = useState({
		top: "0px",
		left: "0px",
	});
	const { orderedColumns, handleColumnOrderChange } = useDataGridColumnOrder(
		columns,
		"deleteProgressDataGrid",
	);

	const {
		pagination: gridPagination,
		setPagination: setGridPagination,
		columnVisibilityModel,
		setColumnVisibilityModel,
		filterModel,
		setFilterModel,
	} = useDeleteProgressGridState();

	const {
		total,
		datalist,
		pagination,
		setPagination,
		setFilter,
		searchResultFetchData,
	} = useSearchResults<DeleteProgressInfo>(
		getDeleteProgressList,
		10_000,
		[
			{
				field: "idx",
				direction: "asc",
			},
		],
		gridPagination,
		toSQLFilter(convertFilterModel(filterModel), columns),
	);
	const { selectedRow, setSelectedRow, restore, retryable, retry } =
		useDeleteProgressInfo();
	const [contextMenu, setContextMenu] = useState<
		| {
				mouseX: number;
				mouseY: number;
		  }
		| undefined
	>(undefined);

	const handleContextMenu = (event: MouseEvent): void => {
		event.preventDefault();
		const idx = Number(event.currentTarget.getAttribute("data-id"));
		const row = datalist.find((r) => r.idx === idx);
		setSelectedRow(row);
		setContextMenu(
			contextMenu == null
				? {
						mouseX: event.clientX - 2,
						mouseY: event.clientY - 4,
					}
				: undefined,
		);
		setToastOpen(false);
	};

	const handleClose = (): void => {
		setContextMenu(undefined);
	};

	const toastTrigger = {
		isOpen: toastOpen,
		onClose: () => {
			setToastMessage("");
			setToastOpen(false);
		},
	};

	// Restore処理
	const restoreDeleteJob = async (): Promise<void> => {
		handleClose();
		const errInfo = await restore();

		// Restore成功
		if (errInfo == null) {
			setSelectedRow(undefined);
			setToastMessage("Succeed Restore.");
			setToastSeverity("success");
			setToastOpen(true);
			return;
		}

		setToastMessage(errInfo?.message ?? "Restore failed");
		setToastSeverity("error");
		setToastOpen(true);
	};

	// Retry処理
	const retryDeleteJob = async (): Promise<void> => {
		handleClose();
		const errorMessage = await retry();
		// Retry成功
		if (errorMessage == null) {
			setToastMessage("Succeed Retry.");
			setToastSeverity("success");
			setToastOpen(true);
			searchResultFetchData();
			return;
		}
		// Retry失敗
		setToastMessage(errorMessage);
		setToastSeverity("error");
		setToastOpen(true);
	};

	// datalist 更新で選択行が消えた場合は選択解除
	useEffect(() => {
		if (selectedRow) {
			const exists = datalist.find((r) => r.idx === selectedRow.idx);
			if (!exists) {
				setSelectedRow(undefined);
			}
		}
	}, [datalist, selectedRow, setSelectedRow]);

	// ------------------------------
	// フィルタ関連
	const handleFilterModelChange = (model: GridFilterModel): void => {
		if (!isFilterPending(model)) {
			setPagination({ ...pagination, page: 0 });
		}
		const convertedModel = convertFilterModel(model);
		setFilterModel(model); // Atomに保存
		setFilter(toSQLFilter(convertedModel, columns));
		// フィルタ変更時はページを先頭へ
		const newPagination = { ...pagination, page: 0 };
		setPagination(newPagination);
		setGridPagination(newPagination);
	};

	const handlePaginationModelChange = (model: {
		page: number;
		pageSize: number;
	}): void => {
		setGridPagination(model);
		setPagination(model);
	};

	return (
		<>
			<DataGridPro
				sx={{ height: "100%", width: "100%" }}
				rows={datalist ?? []}
				rowCount={total}
				slots={{ toolbar: MemoizedDeleteProgressToolBar }}
				slotProps={{
					row: {
						onContextMenu: handleContextMenu,
						style: { cursor: "context-menu" },
					},
				}}
				columns={orderedColumns}
				getRowId={(row) => row.idx}
				disableColumnMenu
				columnHeaderHeight={35}
				disableMultipleRowSelection
				disableVirtualization={DISABLE_VIRTULIZATION}
				rowHeight={30}
				pagination
				paginationMode="server"
				paginationModel={gridPagination}
				pageSizeOptions={[gridPagination.pageSize]}
				onPaginationModelChange={handlePaginationModelChange}
				columnVisibilityModel={columnVisibilityModel}
				onColumnVisibilityModelChange={setColumnVisibilityModel}
				onColumnOrderChange={handleColumnOrderChange}
				filterMode="server"
				filterModel={filterModel}
				onFilterModelChange={handleFilterModelChange}
				onRowSelectionModelChange={(selectedRow) => {
					const sel = Number(selectedRow[0]);
					const row = datalist.find((r) => r.idx === sel);
					setSelectedRow(row);
				}}
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
					data-testid="restore-menu-item"
					onClick={restoreDeleteJob}
					disabled={!selectedRow?.restorable}
				>
					Restore
				</MenuItem>
				<MenuItem
					data-testid="retry-menu-item"
					onClick={retryDeleteJob}
					disabled={!retryable}
				>
					Retry
				</MenuItem>
			</Menu>
			<Toast
				message={toastMessage}
				trigger={toastTrigger}
				anchorOrigin={{ vertical: "top", horizontal: "left" }}
				severity={toastSeverity}
				displayPosition={displayPosition}
			/>
		</>
	);
}
