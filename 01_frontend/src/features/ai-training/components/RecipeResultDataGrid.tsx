import { Menu, MenuItem } from "@mui/material";
import {
	DataGridPro,
	type GridColDef,
	type GridFilterItem,
	type GridFilterModel,
	type GridRenderCellParams,
	getGridSingleSelectOperators,
} from "@mui/x-data-grid-pro";
import { useEffect, useMemo, useRef, useState } from "react";
import {
	ColumnAndFilterToolBar,
	booleanRenderer,
	convertSizeFilterItem,
	reExecutedRenderer,
	sizeFilterOperators,
	sortToolTipText,
} from "~/components/elements";
import { dateTimeWithSecondsOperators } from "~/components/elements/DataGrid/DateTimeSecondFilterOperator";
import { WithSortableHeaderTooltip } from "~/components/elements/DataGrid/WithSortableHeaderTooltip";
import { Toast } from "~/components/elements/Toast";
import { DISABLE_VIRTULIZATION, getIntegratedViewerURL } from "~/config";
import { getResults } from "~/features/job-manager-info/api/getResults";
import {
	convertProcessTimeFilterItem,
	processTimeFilterOperators,
} from "~/features/job-manager-info/components/ProcessTimeFilterOperator";
import { useSearchResults } from "~/features/job-manager-info/hooks/useSearchResults";
import {
	type Result,
	ResultStatus,
	toSortParam,
} from "~/features/job-manager-info/types";
import {
	isFilterPending,
	toSQLFilter,
} from "~/features/misc/types/pagingQueryParam";
import { JobTypeList } from "~/features/recipe/types";
import { useDataGridColumnOrder } from "~/lib/useDataGridColumnOrder";
import {
	toLocalDateStr,
	toNumStr,
	toSizeStr,
	toTimeStr,
} from "~/utils/formatter";
import { useRecipeResultsGridState } from "../hooks/useRecipeResultsGridState";
import { useSourceList } from "../hooks/useSourceList";
import { DesignState } from "../types";

const columns: GridColDef[] = [
	{
		field: "executionDate",
		headerName: "Execution Date",
		width: 150,
		type: "dateTime",
		valueFormatter: ({ value }) => Boolean(value) && toLocalDateStr(value),
		hideable: false,
		filterOperators: dateTimeWithSecondsOperators({ allowSeconds: false }),
	},
	{
		field: "recipe",
		headerName: "Recipe",
		width: 300,
		type: "string",
	},
	{
		field: "jobType",
		headerName: "Job Type",
		width: 115,
		type: "singleSelect",
		valueOptions: [...JobTypeList],
	},
	{
		field: "hasDesign",
		headerName: "Has Design",
		width: 145,
		type: "singleSelect",
		valueFormatter: ({ value }) =>
			value === DesignState.HAS_DESIGN ? "true" : "false",
		valueOptions: [
			{ value: DesignState.HAS_DESIGN, label: "true" },
			{ value: DesignState.NO_DESIGN, label: "false" },
		],
		renderCell: (hasDesign: GridRenderCellParams) =>
			booleanRenderer(hasDesign.value),
	},
	{
		field: "processTime",
		headerName: "Process Time",
		width: 105,
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
		renderCell: (executed: GridRenderCellParams) =>
			reExecutedRenderer(executed.value),
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
		flex: 3,
		minWidth: 128,
		valueFormatter: ({ value }) => toSizeStr(value),
		filterOperators: sizeFilterOperators,
	},
	{ field: "class", headerName: "Class", flex: 1, minWidth: 128 },
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
	{ field: "name", headerName: "Name", flex: 3, minWidth: 128 },
	{ field: "error", headerName: "Error", flex: 3, minWidth: 128 },
];

// 成功ステータスのフィルタを追加
const successStatusFilterItem: GridFilterItem = {
	field: "status",
	operator: "is",
	value: ResultStatus.SUCCESS,
};
const filterConverterMap: Record<
	string,
	(item: GridFilterItem) => GridFilterItem
> = {
	processTime: convertProcessTimeFilterItem,
	diskSize: convertSizeFilterItem,
};
const convertFilterModel = (model: GridFilterModel): GridFilterModel => {
	// UI 側には status 条件を表示しない（削除）
	const convertedItems = model.items
		.filter((item) => item.field !== successStatusFilterItem.field)
		.map((item) => {
			return filterConverterMap[item.field]?.(item) ?? item;
		});
	// サーバー送信用には successStatusFilterItem を先頭に追加して送る（UI 上は見えない）
	return {
		...model,
		items: [successStatusFilterItem, ...convertedItems],
	};
};

export const RecipeResultDataGrid = (): JSX.Element => {
	const {
		pagination: gridPagination,
		setPagination: setGridPagination,
		columnVisibilityModel,
		setColumnVisibilityModel,
		filterModel,
		setFilterModel,
		sort: gridSort,
		setSort: setGridSort,
	} = useRecipeResultsGridState();

	const { total, datalist, pagination, setPagination, setSort, setFilter } =
		useSearchResults<Result>(
			getResults,
			undefined,
			toSortParam(gridSort),
			gridPagination,
			toSQLFilter(convertFilterModel(filterModel), columns),
		);
	const { orderedColumns, handleColumnOrderChange } = useDataGridColumnOrder(
		columns,
		"recipeResultDataGrid",
	);
	const tooltipColumns = useMemo(() => {
		return WithSortableHeaderTooltip(orderedColumns);
	}, [orderedColumns]);
	const { addResultSource, lastAddStatus, message, lastAddSeq, addable } =
		useSourceList();
	const [toastOpen, setToastOpen] = useState(false);
	const selectedResult = useRef<Result>();
	// Menu(Popover)のPaper要素の実寸を測るためのref
	const menuPaperRef = useRef<HTMLDivElement>(null);
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
		setFilter(toSQLFilter(convertFilterModel(model), columns));
	};

	const handleContextMenu = (event: React.MouseEvent<HTMLDivElement>): void => {
		event.preventDefault();

		selectedResult.current =
			datalist[Number(event.currentTarget.getAttribute("data-rowindex"))];

		setContextMenu(
			contextMenu == null
				? { mouseX: event.clientX - 2, mouseY: event.clientY - 4 }
				: undefined,
		);
	};
	const handleClose = (): void => {
		setContextMenu(undefined);
		selectedResult.current = undefined;
	};

	const openIntegratedViewer = (): void => {
		selectedResult.current != null &&
			window.open(getIntegratedViewerURL(selectedResult.current.name));
		handleClose();
	};

	const addToSourceList = (): void => {
		selectedResult.current != null && addResultSource(selectedResult.current);
		handleClose();
	};

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
				<MenuItem onClick={openIntegratedViewer}>Integrated Viewer</MenuItem>
			</Menu>
			<Toast
				message={message || ""}
				trigger={toastTrigger}
				anchorOrigin={{ vertical: "top", horizontal: "left" }}
				severity={lastAddStatus}
				displayPosition={displayPosition}
			/>
		</>
	);
};
