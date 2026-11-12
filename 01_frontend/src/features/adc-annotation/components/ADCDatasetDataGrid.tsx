import { Box } from "@mui/material";
import {
	DataGridPro,
	type GridColDef,
	type GridFilterModel,
	type GridRenderCellParams,
	type GridSortModel,
	useGridApiRef,
} from "@mui/x-data-grid-pro";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
	DataGridPaginationWithRefreshButton,
	sortToolTipText,
} from "~/components/elements";
import { dateTimeWithSecondsOperators } from "~/components/elements/DataGrid/DateTimeSecondFilterOperator";
import { WithSortableHeaderTooltip } from "~/components/elements/DataGrid/WithSortableHeaderTooltip";
import { DISABLE_VIRTULIZATION } from "~/config";
import { useDefectViewColumns } from "~/features/defect-list/components/DefectViewColumns";
import { toSortParam } from "~/features/job-manager-info/types/converter";
import {
	isFilterPending,
	toSQLFilter,
} from "~/features/misc/types/pagingQueryParam";
import { toLocalDateStr } from "~/utils/formatter";
import { useDatasetDefect } from "../hooks/useDatasetDefect";
import {
	CategoryTypeList,
	PredictedTypeList,
	getCategoryColor,
} from "../types";
import { ADCDataGridToolbar } from "./ADCDataGridToolbar";

/**
 * Reactコンポーネント内で使用するフック版
 */
const useDatasetDefectViewColumns = (): GridColDef[] => {
	const common = useDefectViewColumns();

	const enhancedCommon = useMemo((): GridColDef[] => {
		return common.flatMap((col: GridColDef) => {
			const field = String(col.field);
			if (
				field === "src" ||
				field === "defectClass" ||
				field === "defectClassName"
			) {
				return [];
			}
			if (field === "defectId") {
				return [
					{ ...col, headerName: "DefectId", hideable: true, width: 85 },
					{
						field: "className",
						headerName: "Class",
						width: 100,
						type: "string",
					},
					{
						field: "recipeName",
						headerName: "Recipe",
						width: 140,
						type: "string",
					},
				];
			}
			if (field === "abnormality") {
				return [{ ...col, hideable: true }];
			}
			return [col];
		});
	}, [common]);

	const cols = useMemo((): GridColDef[] => {
		return [
			{
				field: "datasetId",
				headerName: "ID",
				width: 60,
				type: "number",
				hideable: false,
			},
			{
				field: "toolExecutionDate",
				headerName: "Tool",
				width: 140,
				type: "dateTime",
				valueFormatter: ({ value }) => Boolean(value) && toLocalDateStr(value),
				filterOperators: dateTimeWithSecondsOperators({ allowSeconds: false }),
			},
			{
				field: "resultExecutionDate",
				headerName: "Result",
				width: 140,
				type: "dateTime",
				valueFormatter: ({ value }) => Boolean(value) && toLocalDateStr(value),
				filterOperators: dateTimeWithSecondsOperators({ allowSeconds: false }),
			},
			...enhancedCommon,
			{
				field: "category",
				headerName: "Category",
				type: "singleSelect",
				valueOptions: [...CategoryTypeList],
				renderCell: (params: GridRenderCellParams) => {
					const code = getCategoryColor(params.value);
					return (
						<Box
							sx={{
								width: "100%",
								height: "100%",
								display: "flex",
								alignItems: "center",
								justifyContent: "center",
								bgcolor: code,
								color: (theme) =>
									theme.palette.getContrastText(
										code && code !== "transparent"
											? code
											: theme.palette.background.paper,
									),
								px: 1,
								borderRadius: 0.5,
							}}
						>
							{params.value}
						</Box>
					);
				},
				width: 75,
			},
			{
				field: "predicted",
				headerName: "Predicted",
				type: "singleSelect",
				valueOptions: [...PredictedTypeList],
				width: 100,
			},
		];
	}, [enhancedCommon]);

	return useMemo(() => {
		return WithSortableHeaderTooltip(cols);
	}, [cols]);
};

/** DatasetDefect用 field名変換Map(K:GUI用field名,V:Server Query用field名) */
const fieldConvertMap: Record<string, string> = {
	defectClassName: "defectClass",
};

const convertFilterField = (
	model?: GridFilterModel,
): GridFilterModel | undefined => {
	if (model == null) return undefined;
	return {
		...model,
		items: model.items.map((item) => ({
			...item,
			field: fieldConvertMap[item.field] || item.field,
		})),
	};
};

export const ADCDatasetDataGrid = (): JSX.Element => {
	const {
		sort,
		defectList,
		total,
		pagination,
		setPagination,
		setSort,
		setFilter,
		setDatasetDefect,
	} = useDatasetDefect();
	const columns = useDatasetDefectViewColumns();
	const apiRef = useGridApiRef();

	const [sortModel, setSortModel] = useState<GridSortModel | undefined>(
		undefined,
	);
	const [filterModel, setFilterModel] = useState<GridFilterModel | undefined>(
		undefined,
	);

	// sort条件変更契機にDataGridの型に変換(SortButtonでの条件変更もあるため、sortModelはuseStateで管理)
	useEffect(() => {
		const sortModelWork: GridSortModel = [];
		for (const sortItem of sort) {
			sortModelWork.push({ field: sortItem.field, sort: sortItem.direction });
		}
		setSortModel(sortModelWork);
	}, [sort]);

	/**
	 * DataGrid操作によるSort条件の変更設定
	 * @param model DataGridのsortモデル
	 * @returns 無し
	 */
	const handleSortModelChange = useCallback(
		(model: GridSortModel): void => {
			setSort(toSortParam(model));
		},
		[setSort],
	);

	/**
	 * Filters操作によるFilter条件の変更設定
	 * @param model DataGridのFilterモデル
	 * @returns 無し
	 */
	const handleFilterModelChange = useCallback(
		(model: GridFilterModel): void => {
			if (model == null || model.items.length === 0) {
				setFilter(undefined);
				setFilterModel(undefined);
				return;
			}
			setFilterModel(model);
			if (isFilterPending(model)) return;

			setPagination({ ...pagination, page: 0 });
			setFilter(toSQLFilter(convertFilterField(model), columns));
		},
		[setFilter, setPagination, pagination, columns],
	);

	useEffect(() => {
		setDatasetDefect();
	}, [setDatasetDefect]);

	/**
	 * DataGridPaginationリフレッシュ関数
	 * @param 無し
	 * @returns 無し
	 */
	const handleClickRefresh = (): void => {
		setDatasetDefect();
	};

	return (
		<Box sx={{ height: "100%" }}>
			<DataGridPro
				columns={columns}
				rows={defectList}
				sx={{ height: "100%", border: 0 }}
				columnHeaderHeight={20}
				rowHeight={20}
				slots={{
					toolbar: () => ADCDataGridToolbar(columns),
					pagination: () =>
						DataGridPaginationWithRefreshButton({ handleClickRefresh }),
				}}
				localeText={sortToolTipText}
				disableColumnMenu
				disableMultipleRowSelection
				hideFooterSelectedRowCount
				disableVirtualization={DISABLE_VIRTULIZATION}
				getRowId={(row) => row.datasetId}
				// ページ切り替え時にデータfetchする
				paginationMode="server"
				// データ総件数
				rowCount={total}
				pagination
				paginationModel={pagination}
				pageSizeOptions={[pagination.pageSize]}
				onPaginationModelChange={setPagination}
				// ソート条件指定時
				sortingMode="server"
				sortModel={sortModel}
				onSortModelChange={handleSortModelChange}
				// フィルタ条件指定時
				filterMode="server"
				filterModel={filterModel}
				onFilterModelChange={handleFilterModelChange}
				apiRef={apiRef}
			/>
		</Box>
	);
};
