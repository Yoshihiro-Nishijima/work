import { Box, type SxProps, type Theme } from "@mui/material";
import {
	DataGridPro,
	type GridColDef,
	type GridRowSelectionModel,
	gridFilteredSortedRowEntriesSelector,
	useGridApiRef,
} from "@mui/x-data-grid-pro";
import { useEffect, useMemo } from "react";

import { ColumnAndFilterToolBar, sortToolTipText } from "~/components/elements";
import { WithSortableHeaderTooltip } from "~/components/elements/DataGrid/WithSortableHeaderTooltip";
import { DISABLE_VIRTULIZATION } from "~/config";
import type { DefectRecord } from "~/features/defect-list/types";
import { useDefectDisplay } from "~/features/display-setting/hooks/useDefectDisplay";
import type { DefectDisplay } from "~/features/display-setting/types";

import { LayerFilterOperator } from "~/features/defect-list/components/LayerFilterOperator";
import { useDefect } from "../hooks/useDefect";

const CLASS_NUMBERS = [-1, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
const CLASS_NAMES = [
	"Unknown",
	"CAT1",
	"CAT2",
	"CAT3",
	"CAT4",
	"CAT5",
	"CAT6",
	"CAT7",
	"CAT8",
	"CAT9",
	"CAT10",
];

interface DefectHeightSize {
	sx?: SxProps<Theme>;
}

const getColumns = (defectDisplayList: DefectDisplay[]): GridColDef[] => {
	return [
		{
			field: "defectId",
			headerName: "ID",
			hideable: false,
			type: "number",
			width: 60,
		},
		{
			field: "defectClass",
			headerName: "Class No.",
			type: "singleSelect",
			valueOptions: CLASS_NUMBERS,
		},
		{
			field: "defectClassName",
			headerName: "Class Name",
			type: "singleSelect",
			valueOptions: CLASS_NAMES,
			valueGetter: ({ row }) => {
				const defectClass = row.defectClass;
				if (defectClass === 0) return "";
				if (defectClass > 0 && defectClass <= 10) {
					return CLASS_NAMES[defectClass];
				}
				return CLASS_NAMES[0];
			},
		},
		{
			field: "abnormality",
			headerName: "Abnormality",
			hideable: false,
			type: "number",
			width: 115,
		},
		{
			field: "width",
			headerName: "Width",
			type: "number",
			width: 85,
		},
		{
			field: "height",
			headerName: "Height",
			type: "number",
			width: 85,
		},
		{
			field: "gray",
			headerName: "GrayScale",
			type: "number",
			width: 105,
		},
		{
			field: "grayDiff",
			headerName: "GrayScaleDiff",
			type: "number",
			width: 125,
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
			valueOptions: () =>
				defectDisplayList.map((d, index) => {
					return {
						value: index + 1,
						label: d.name,
					};
				}),
			width: 75,
		},
		{ field: "area", headerName: "Area", type: "number", width: 60 },
		{ field: "mFOVno", headerName: "mFOV No", type: "number", width: 60 },
		{ field: "sFOVno", headerName: "sFOV No", type: "number", width: 60 },
		{ field: "chipX", headerName: "Chip X", type: "number", width: 70 },
		{ field: "chipY", headerName: "Chip Y", type: "number", width: 70 },
		{ field: "coordX", headerName: "Coord X", type: "number", width: 100 },
		{ field: "coordY", headerName: "Coord Y", type: "number", width: 100 },
	];
};

const filteredEq = (arr1: DefectRecord[], arr2: DefectRecord[]): boolean => {
	if (arr1.length !== arr2.length) return false;
	for (let i = 0; i < arr1.length; i++) {
		if (arr1[i] !== arr2[i]) return false;
	}
	return true;
};

export const DefectDataGrid = ({ sx }: DefectHeightSize): JSX.Element => {
	const {
		defectList,
		filteredDefects,
		selectedDefect,
		setFilteredDefects,
		setSelectedDefect,
		setDefect,
	} = useDefect();
	const { defectDisplayRowList } = useDefectDisplay();
	const apiRef = useGridApiRef();
	const baseColumns = useMemo(() => {
		return getColumns(defectDisplayRowList);
	}, [defectDisplayRowList]);
	const columns = useMemo(() => {
		return WithSortableHeaderTooltip(baseColumns);
	}, [baseColumns]);

	/**
	 * Row選択時のDefect選択行の変更設定
	 * @param model DataGridのRowSelectionモデル
	 * @returns 無し
	 */
	const handleOnRowSelectionModelChange = (
		model: GridRowSelectionModel,
	): void => {
		if (model[0] == null || defectList.length === 0) {
			setSelectedDefect(undefined);
			return;
		}
		const selectedRowInfo = defectList.find(
			defectList[0].defectId // TestRunの結果にはdefectIdが無い
				? ({ defectId }) => defectId === model[0]
				: ({ defectNo }) => defectNo === model[0],
		);
		if (selectedRowInfo == null) {
			// defectIdを一意のIndexにしたテーブルのため本来は見つかるはず
			setSelectedDefect(undefined);
			return;
		}
		setSelectedDefect(selectedRowInfo);
	};

	useEffect(() => {
		setDefect();
	}, [setDefect]);

	return (
		<Box sx={{ ...sx, width: "100%" }}>
			<DataGridPro
				columns={columns}
				rows={defectList}
				sx={{ height: "100%", width: "100%", border: 0 }}
				hideFooter
				columnHeaderHeight={20}
				rowHeight={20}
				slots={{ toolbar: ColumnAndFilterToolBar }}
				localeText={sortToolTipText}
				disableColumnMenu
				disableMultipleRowSelection
				disableVirtualization={DISABLE_VIRTULIZATION}
				getRowId={(row) => row.defectId ?? row.defectNo}
				initialState={{
					sorting: {
						sortModel: [{ field: "abnormality", sort: "desc" }],
					},
				}}
				rowSelectionModel={
					selectedDefect != null
						? [selectedDefect.defectId ?? selectedDefect.defectNo]
						: []
				}
				onRowSelectionModelChange={handleOnRowSelectionModelChange}
				onStateChange={() => {
					const filtered = gridFilteredSortedRowEntriesSelector(apiRef).map(
						(entry) => entry.model as DefectRecord,
					);
					if (!filteredEq(filtered, filteredDefects)) {
						setFilteredDefects(filtered);
						if (
							selectedDefect != null &&
							!filtered.some(
								(d) =>
									d.defectId === selectedDefect?.defectId ||
									d.defectNo === selectedDefect.defectNo,
							)
						) {
							setSelectedDefect(undefined);
						}
					}
				}}
				apiRef={apiRef}
			/>
		</Box>
	);
};
