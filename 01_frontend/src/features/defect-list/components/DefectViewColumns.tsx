import type {
	GridColDef,
	GridFilterOperator,
	GridRenderCellParams,
} from "@mui/x-data-grid-pro";
import { getGridNumericOperators } from "@mui/x-data-grid-pro";
import { useMemo } from "react";
import { useDefectHistogramFilterOperators } from "~/features/defect-histogram/hooks/useDefectHistogramFilterOperators";
import { useDefectDisplay } from "~/features/display-setting/hooks/useDefectDisplay";
import type { DefectDisplay } from "~/features/display-setting/types";
import {
	CLASS_NAMES,
	createFormatCaughtBy,
	formatClassName,
} from "../utils/defectFormatters";
import { LayerFilterOperator } from "./LayerFilterOperator";

const RenderCellComponent = (params: GridRenderCellParams): JSX.Element => {
	return (
		<div>
			<img
				src={params.value}
				width={125}
				height={125}
				alt={String(params.id)}
			/>
		</div>
	);
};

/**
 * Defectデータグリッドの列定義を生成する関数
 * フック外でも使用可能（例: useDefect内のtoSQLFilter）
 */
export const DefectViewColumns = (
	defectDisplayList: DefectDisplay[],
	defectHistogramFilterOperators: GridFilterOperator[] = [],
): GridColDef[] => {
	const formatCaughtBy = createFormatCaughtBy(defectDisplayList);

	return [
		{
			field: "defectId",
			headerName: "ID",
			hideable: false,
			type: "number",
			width: 60,
			filterOperators: defectHistogramFilterOperators,
		},
		{
			field: "src",
			headerName: "Thumbnail",
			sortable: false,
			filterable: false,
			hideable: false,
			type: "number",
			align: "center",
			width: 70,
			renderCell: (params) => {
				return <RenderCellComponent {...params} />;
			},
		},
		{
			field: "defectClass",
			headerName: "Class No.",
			type: "singleSelect",
			valueOptions: CLASS_NAMES.map((opt) => opt.value),
		},
		{
			field: "defectClassName",
			headerName: "Class Name",
			type: "singleSelect",
			valueOptions: CLASS_NAMES,
			valueGetter: ({ row }) => {
				return row.defectClass;
			},
			valueFormatter: ({ value }) => formatClassName(value),
		},
		{
			field: "abnormality",
			headerName: "Abnormality",
			hideable: false,
			type: "number",
			width: 115,
			filterOperators: defectHistogramFilterOperators,
		},
		{
			field: "width",
			headerName: "Width",
			type: "number",
			width: 85,
			filterOperators: defectHistogramFilterOperators,
		},
		{
			field: "height",
			headerName: "Height",
			type: "number",
			width: 85,
			filterOperators: defectHistogramFilterOperators,
		},
		{
			field: "gray",
			headerName: "GrayScale",
			type: "number",
			width: 105,
			filterOperators: defectHistogramFilterOperators,
		},
		{
			field: "grayDiff",
			headerName: "GrayScaleDiff",
			type: "number",
			width: 125,
			filterOperators: defectHistogramFilterOperators,
		},
		{
			field: "layers",
			headerName: "Layer",
			sortable: false,
			type: "string",
			width: 90,
			filterOperators: [LayerFilterOperator],
		},
		{
			field: "caughtBy",
			headerName: "Type",
			type: "singleSelect",
			valueOptions: defectDisplayList.map((d, index) => ({
				value: index + 1,
				label: d.name,
			})),
			valueFormatter: ({ value }) => formatCaughtBy(value),
			width: 75,
		},
		{
			field: "area",
			headerName: "Area",
			type: "number",
			width: 60,
			filterOperators: defectHistogramFilterOperators,
		},
		{
			field: "mFOVno",
			headerName: "mFOV No",
			type: "number",
			width: 60,
			filterOperators: defectHistogramFilterOperators,
		},
		{
			field: "sFOVno",
			headerName: "S FOV No",
			type: "number",
			width: 60,
			filterOperators: defectHistogramFilterOperators,
		},
		{
			field: "chipX",
			headerName: "Chip X",
			type: "number",
			width: 70,
			filterOperators: defectHistogramFilterOperators,
		},
		{
			field: "chipY",
			headerName: "Chip Y",
			type: "number",
			width: 70,
			filterOperators: defectHistogramFilterOperators,
		},
		{
			field: "coordX",
			headerName: "Coord X",
			type: "number",
			width: 100,
			filterOperators: defectHistogramFilterOperators,
		},
		{
			field: "coordY",
			headerName: "Coord Y",
			type: "number",
			width: 100,
			filterOperators: defectHistogramFilterOperators,
		},
	];
};

/**
 * Reactコンポーネント内で使用するフック版
 * useDefectDisplayから自動的にdefectDisplayListを取得
 */
export const useDefectViewColumns = (
	options: { enableHistogram?: boolean } = {},
): GridColDef[] => {
	const { defectDisplayRowList } = useDefectDisplay();
	const baseColumns = useMemo(
		() => DefectViewColumns(defectDisplayRowList),
		[defectDisplayRowList],
	);
	const fieldHeaderNames = useMemo(
		() =>
			baseColumns.reduce<Record<string, string>>((headerNames, column) => {
				if (column.headerName != null) {
					headerNames[column.field] = column.headerName;
				}
				return headerNames;
			}, {}),
		[baseColumns],
	);
	const { defectHistogramFilterOperators } =
		useDefectHistogramFilterOperators(fieldHeaderNames);
	const defaultFilterOperators = useMemo(() => getGridNumericOperators(), []);
	const filterOperators = options.enableHistogram
		? defectHistogramFilterOperators
		: defaultFilterOperators;

	return useMemo(
		() => DefectViewColumns(defectDisplayRowList, filterOperators),
		[defectDisplayRowList, filterOperators],
	);
};
