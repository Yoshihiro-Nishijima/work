import {
	DataGridPro,
	type GridColDef,
	type GridFilterModel,
} from "@mui/x-data-grid-pro";
import { useMemo } from "react";
import { ColumnAndFilterToolBar, sortToolTipText } from "~/components/elements";
import { dateTimeWithSecondsOperators } from "~/components/elements/DataGrid/DateTimeSecondFilterOperator";
import { WithSortableHeaderTooltip } from "~/components/elements/DataGrid/WithSortableHeaderTooltip";
import { DISABLE_VIRTULIZATION } from "~/config";
import {
	isFilterPending,
	toSQLFilter,
} from "~/features/misc/types/pagingQueryParam";
import { useDataGridColumnOrder } from "~/lib/useDataGridColumnOrder";
import { toLocalDateStr } from "~/utils/formatter";
import { getDesign } from "../api/getDesign";
import { useDesignGridState } from "../hooks/useDesignGridState";
import { useSearchResults } from "../hooks/useSearchResults";
import { useSelectedJobInfo } from "../hooks/useSelectedJobInfo";
import { type Design, toSortParam } from "../types";

const columns: GridColDef[] = [
	{
		field: "name",
		headerName: "Design Data",
		flex: 1,
		minWidth: 128,
		hideable: false,
	},
	{ field: "status", headerName: "Status", flex: 1, minWidth: 128 },
	{
		field: "importDate",
		headerName: "Imported Date",
		width: 180,
		type: "dateTime",
		valueFormatter: ({ value }) => (value == null ? "" : toLocalDateStr(value)),
		filterOperators: dateTimeWithSecondsOperators({ allowSeconds: false }),
	},
	{ field: "fileType", headerName: "File Type", flex: 1, minWidth: 128 },
	{
		field: "cellNum",
		headerName: "Cell Num",
		flex: 1,
		minWidth: 128,
		type: "number",
	},
	{
		field: "layerNum",
		headerName: "Layer Num",
		flex: 1,
		minWidth: 128,
		type: "number",
	},
	{
		field: "layerDatatypeCsv",
		headerName: "Layer/DataType",
		flex: 1,
		minWidth: 128,
	},
];

export function DesignDataGrid(): JSX.Element {
	const {
		pagination: gridPagination,
		setPagination: setGridPagination,
		columnVisibilityModel,
		setColumnVisibilityModel,
		filterModel,
		setFilterModel,
		sort: gridSort,
		setSort: setGridSort,
	} = useDesignGridState();

	const { total, datalist, pagination, setPagination, setSort, setFilter } =
		useSearchResults<Design>(
			getDesign,
			undefined,
			toSortParam(gridSort),
			gridPagination,
			toSQLFilter(filterModel, columns),
		);
	const { selectedDesignJobName, setSelectedDesignJobName } =
		useSelectedJobInfo();
	const { orderedColumns, handleColumnOrderChange } = useDataGridColumnOrder(
		columns,
		"designDataGrid",
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

	const handleFilterModelChange = (model: GridFilterModel): void => {
		if (!isFilterPending(model)) {
			setPagination({ ...pagination, page: 0 });
		}
		setFilterModel(model);
		setFilter(toSQLFilter(model, columns));
	};

	return (
		<DataGridPro
			columns={tooltipColumns}
			rows={datalist}
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
			onRowSelectionModelChange={(selectedRowIdx) => {
				if (selectedRowIdx.length === 0) return;
				setSelectedDesignJobName(selectedRowIdx[0] as string);
			}}
			rowSelectionModel={[selectedDesignJobName]}
		/>
	);
}
