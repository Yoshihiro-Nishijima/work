import { Box, Button, Stack, styled } from "@mui/material";
import {
	DataGridPro,
	type GridColDef,
	type GridColumnGroupingModel,
	type GridRowClassNameParams,
	type GridRowModel,
	type GridRowSelectionModel,
	type GridValidRowModel,
} from "@mui/x-data-grid-pro";
import { useCallback, useMemo } from "react";

import { Fieldset } from "~/components/layouts";
import { DISABLE_VIRTULIZATION } from "~/config";

import {
	IntNumInput,
	formatIntNumber,
	formatSingleSelect,
} from "~/components/elements/DataGridCustomColDefs";
import { useDesignLayers } from "../../hooks";
import {
	type FlatDesignLayer,
	LayerTypeList,
	ProcessTypeList,
	ToneTypeList,
} from "../../types";

// LayerIDと紐づくLayerNoを1行風に表示する DataGrid
const RowSpanningDataGrid = styled(DataGridPro)(() => ({
	"& .border_none": {
		"& .MuiDataGrid-cell": {
			border: 0,
		},
	},
	"& .border_bottom": {
		"& .MuiDataGrid-cell": {
			border: 0,
			borderBottom: "1px solid rgba(128, 128, 128, 0.35)",
		},
	},
}));

const COLUMNS: GridColDef[] = [
	{
		field: "layerID",
		headerName: "Layer ID",
		type: "number",
		sortable: false,
		width: 80,
		valueFormatter: formatIntNumber,
		renderEditCell: IntNumInput,
	},
	{
		field: "type",
		headerName: "Type",
		type: "singleSelect",
		valueOptions: [...LayerTypeList],
		sortable: false,
		valueFormatter: (params) => formatSingleSelect(params, [...LayerTypeList]),
		width: 80,
	},
	{
		field: "tone",
		headerName: "Tone",
		type: "singleSelect",
		valueOptions: [...ToneTypeList],
		sortable: false,
		valueFormatter: (params) => formatSingleSelect(params, [...ToneTypeList]),
		width: 40,
	},
	{
		field: "process",
		headerName: "Process",
		type: "singleSelect",
		valueOptions: [...ProcessTypeList],
		sortable: false,
		valueFormatter: (params) =>
			formatSingleSelect(params, [...ProcessTypeList]),
		width: 80,
	},
	{
		field: "layerNo",
		headerName: "Layer No",
		type: "number",
		sortable: false,
		width: 80,
		valueFormatter: formatIntNumber,
		renderEditCell: IntNumInput,
	},
	{
		field: "dataType",
		headerName: "Data Type",
		type: "number",
		sortable: false,
		width: 80,
		valueFormatter: formatIntNumber,
		renderEditCell: IntNumInput,
	},
	{
		field: "filterDilationX",
		headerName: "X",
		type: "number",
		sortable: false,
		width: 40,
		valueFormatter: (params) => formatIntNumber(params, -100, 100),
		renderEditCell: (params) => IntNumInput(params, -100, 100),
		cellClassName: "col-filterDilation",
	},
	{
		field: "filterDilationY",
		headerName: "Y",
		type: "number",
		sortable: false,
		width: 40,
		valueFormatter: (params) => formatIntNumber(params, -100, 100),
		renderEditCell: (params) => IntNumInput(params, -100, 100),
		cellClassName: "col-filterDilation",
	},
];

/** FilterDilationグルーピング用カラム定義 */
const columnGroupingModel: GridColumnGroupingModel = [
	{
		groupId: "filterDilation",
		headerName: "Filter Dilation",
		headerAlign: "center",
		children: [{ field: "filterDilationX" }, { field: "filterDilationY" }],
	},
];

export interface DesignLayerDataGridProps {
	disabled?: boolean;
	isTestRun?: boolean;
}

export const DesignLayerDataGrid = ({
	disabled,
	isTestRun,
}: DesignLayerDataGridProps): JSX.Element => {
	const {
		designLayers,
		deletableLayerID,
		addableLayerNo,
		deletableLayerNo,
		setSelectedRow,
		addLayer,
		addLayerNo,
		removeLayer,
		removeLayerNo,
		updateRow,
	} = useDesignLayers();

	const getRowClassName = useCallback(
		(params: GridRowClassNameParams<GridValidRowModel>): string => {
			// 最下行または下がID行の場合、
			if (
				designLayers.length === params.indexRelativeToCurrentPage + 1 ||
				(designLayers.length > params.indexRelativeToCurrentPage + 1 &&
					designLayers[params.indexRelativeToCurrentPage + 1] != null &&
					designLayers[params.indexRelativeToCurrentPage + 1].layerID != null)
			) {
				return "border_bottom";
			}
			return "border_none";
		},
		[designLayers],
	);

	const processRowUpdate = useCallback(
		async (newRow: GridRowModel, oldRow: GridRowModel) =>
			await new Promise<GridRowModel>((resolve) => {
				updateRow(newRow as FlatDesignLayer, oldRow as FlatDesignLayer);
				resolve(newRow);
			}),
		[updateRow],
	);
	const handleProcessRowUpdateError = useCallback((_error: Error) => {}, []);

	// DataGridの編集可否設定(引数だけで決まるのでMemo化)
	const [columns, dataGridSx] = useMemo(() => {
		if (disabled)
			return [COLUMNS, { "& .MuiDataGrid-cell": { color: "text.disabled" } }];

		// TestRunはFilter Dilation X/Yのみ編集可
		if (isTestRun)
			return [
				COLUMNS.map((column) =>
					column.field === "filterDilationX" ||
					column.field === "filterDilationY"
						? { ...column, editable: true }
						: column,
				),
				{
					"& .MuiDataGrid-cell:not(.col-filterDilation)": {
						color: "text.disabled",
					},
				},
			];

		return [
			COLUMNS.map((column) => ({ ...column, editable: true })),
			undefined,
		];
	}, [disabled, isTestRun]);

	return (
		<Fieldset legend="Design Layer">
			<Stack>
				{!isTestRun && (
					<Stack direction="row" spacing={2}>
						<Button onClick={addLayer} disabled={disabled}>
							ADD LAYER ID
						</Button>
						<Button
							onClick={removeLayer}
							disabled={!deletableLayerID || disabled}
						>
							DELETE LAYER ID
						</Button>
						<Button onClick={addLayerNo} disabled={!addableLayerNo || disabled}>
							ADD LAYER NO
						</Button>
						<Button
							onClick={removeLayerNo}
							disabled={!deletableLayerNo || disabled}
						>
							DELETE LAYER NO
						</Button>
					</Stack>
				)}
				<Box sx={{ height: 200 }}>
					<RowSpanningDataGrid
						experimentalFeatures={{ columnGrouping: true }}
						columns={columns}
						columnGroupingModel={columnGroupingModel}
						rows={designLayers}
						columnHeaderHeight={25}
						rowHeight={25}
						hideFooter
						disableColumnMenu
						onRowSelectionModelChange={(rowIds: GridRowSelectionModel) => {
							setSelectedRow(Number(rowIds[0]));
						}}
						processRowUpdate={processRowUpdate}
						onProcessRowUpdateError={handleProcessRowUpdateError}
						getRowClassName={(params) => getRowClassName(params)}
						disableVirtualization={DISABLE_VIRTULIZATION}
						disableMultipleRowSelection={disabled}
						disableRowSelectionOnClick={disabled}
						sx={dataGridSx}
					/>
				</Box>
			</Stack>
		</Fieldset>
	);
};
