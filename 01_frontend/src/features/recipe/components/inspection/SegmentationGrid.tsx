import { Box, Chip, Grid } from "@mui/material";
import {
	DataGridPro,
	type DataGridProProps,
	type GridColDef,
	type GridRenderCellParams,
	type GridRowModel,
	type GridValueFormatterParams,
	type GridValueSetterParams,
} from "@mui/x-data-grid-pro";
import { useEffect, useState } from "react";

import { NumberInput } from "~/components/elements";
import {
	useInspectionParam,
	useSetInspectionParam,
} from "~/features/recipe/hooks/useInspectionParam";
import { useSegmentation } from "~/features/recipe/hooks/useSegmentation";

import { DISABLE_VIRTULIZATION } from "~/config";
import { segmentationColorList } from "../../types";

interface SegmentationGridProp {
	no: number;
	sensitivity: number;
}

function colorRenderer(no: number): JSX.Element | undefined {
	if (segmentationColorList.length < no) {
		return undefined;
	}

	return (
		<Chip
			sx={{
				width: 1,
				height: 3 / 4,
				backgroundColor: segmentationColorList[no + 1],
			}}
		/>
	);
}

// 入力値の変更処理
function valueSetter(
	// biome-ignore lint/suspicious/noExplicitAny: ライブラリ側でany型を使用している為、指摘対象外
	params: GridValueSetterParams<any, number>,
	// biome-ignore lint/suspicious/noExplicitAny: ライブラリ側でany型を使用している為、指摘対象外
): GridValueSetterParams<any, number> {
	// 0.0 ~ 100.0の間で補正
	if (params.value < 0) {
		return { ...params.row, sensitivity: 0 };
	}
	if (params.value > 100) {
		return { ...params.row, sensitivity: 100 };
	}
	return { ...params.row, sensitivity: Math.floor(params.value * 10) / 10 };
}

const valueFormatter = (params: GridValueFormatterParams<number>): string => {
	if (params.value == null) {
		return "0.0";
	}

	return params.value.toFixed(1);
};

const columns: GridColDef[] = [
	{
		field: "no",
		headerName: "Segment",
		align: "center",
		width: 100,
		sortable: false,
		renderCell: (params: GridRenderCellParams) => colorRenderer(params.value),
	},
	{
		field: "sensitivity",
		headerName: "Sensitivity [%]",
		align: "right",
		width: 120,
		type: "number",
		editable: true,
		sortable: false,
		renderEditCell: ({ api, id, field, value }) => (
			<NumberInput
				num={value}
				setNum={(value) => {
					void api.setEditCellValue({ id, field, value, debounceMs: 200 });
				}}
				step={0.1}
				max={100}
				decimalPlaces={1}
			/>
		),
		valueSetter,
		valueFormatter,
	},
];

export const SegmentationGrid = (): JSX.Element => {
	const { segSensitivity, model } = useInspectionParam();
	const { setSegSensitivity } = useSetInspectionParam();
	const { numberOfSegments } = useSegmentation(model);

	const [segmentationList1, setSegmentationList1] = useState<
		SegmentationGridProp[]
	>([]);
	const [segmentationList2, setSegmentationList2] = useState<
		SegmentationGridProp[]
	>([]);
	useEffect(() => {
		const alist = Array.from({ length: numberOfSegments }, (_, index) => ({
			no: index,
			sensitivity: index < segSensitivity.length ? segSensitivity[index] : 0,
		}));

		setSegmentationList1(alist.slice(0, 10));
		if (alist.length > 10) setSegmentationList2(alist.slice(10, 20));
	}, [segSensitivity, numberOfSegments]);

	const dataGridProps = (rows: SegmentationGridProp[]): DataGridProProps => {
		return {
			columns,
			sx: { height: "100%" },
			columnHeaderHeight: 40,
			disableColumnFilter: true,
			disableColumnMenu: true,
			disableColumnResize: true,
			disableVirtualization: DISABLE_VIRTULIZATION,
			rows,
			rowHeight: 26,
			hideFooter: true,
			getRowId: (row: SegmentationGridProp) => row.no,
			processRowUpdate: (newRow: GridRowModel<SegmentationGridProp>) => {
				const setSensitivityState = [...segSensitivity];
				setSensitivityState[newRow.no] = newRow.sensitivity;
				setSegSensitivity(setSensitivityState);
				return newRow;
			},
		};
	};

	return (
		<Box>
			<Grid container spacing={1}>
				<Grid item xs={6}>
					<DataGridPro {...dataGridProps(segmentationList1)} />
				</Grid>
				{segmentationList2.length > 0 ? (
					<Grid item xs={6}>
						<DataGridPro {...dataGridProps(segmentationList2)} />
					</Grid>
				) : undefined}
			</Grid>
		</Box>
	);
};
