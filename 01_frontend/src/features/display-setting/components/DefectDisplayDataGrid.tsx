import SaveIcon from "@mui/icons-material/Save";
import Square from "@mui/icons-material/Square";
import { Box, Stack } from "@mui/system";
import {
	DataGridPro,
	type GridColDef,
	type GridPreProcessEditCellProps,
	type GridRenderCellParams,
	useGridApiRef,
} from "@mui/x-data-grid-pro";
import { useMemo, useState } from "react";

import { ColorPickerEditCell } from "~/components/elements/ColorPickerEditCell";
import { sortToolTipText } from "~/components/elements/DataGrid/SortButton";
import { WithSortableHeaderTooltip } from "~/components/elements/DataGrid/WithSortableHeaderTooltip";
import { FilteredTextEditCell } from "~/components/elements/FilteredTextEditCell";
import PrimaryButton from "~/components/elements/PrimaryButton";
import { ToastAlert } from "~/features/upload-config/components/ToastAlert";
import {
	ALLOWED_DEFECT_DISPLAY_NAME_CHAR_REGEX,
	isHexColor,
} from "~/features/upload-config/hooks";
import { saveDefectDisplayList } from "../api/saveDefectDisplayList";
import { useDefectDisplay } from "../hooks/useDefectDisplay";
import type { DefectDisplayRow } from "../types";

function colorRenderer(color: string): JSX.Element {
	return (
		<Stack direction="row" spacing={2} alignItems="center">
			<Square sx={{ color }} />
			{color}
		</Stack>
	);
}

const columns: GridColDef[] = [
	{ field: "filterNo", headerName: "Filter#", type: "number", width: 80 },
	{
		field: "name",
		headerName: "Name",
		type: "string",
		width: 180,
		editable: true,
		renderEditCell: FilteredTextEditCell(
			ALLOWED_DEFECT_DISPLAY_NAME_CHAR_REGEX,
			63,
		),
	},
	{
		field: "color",
		headerName: "Color",
		type: "string",
		width: 180,
		editable: true,
		renderEditCell: ColorPickerEditCell(),
		preProcessEditCellProps: (params: GridPreProcessEditCellProps<string>) => {
			if (params.props.value == null) {
				return { ...params.props, error: true };
			}
			const hasError = !isHexColor(params.props.value);
			return { ...params.props, error: hasError };
		},
		renderCell: (color: GridRenderCellParams) => colorRenderer(color.value),
	},
];

export const DefectDisplayDataGrid = (): JSX.Element => {
	const [successOpen, setSuccessOpen] = useState(false);
	const [failureOpen, setFailureOpen] = useState(false);
	const apiRef = useGridApiRef();
	const [isSaving, setIsSaving] = useState(false);
	const { defectDisplayRowList } = useDefectDisplay();
	const tooltipColumns = useMemo(() => {
		return WithSortableHeaderTooltip(columns);
	}, []);

	const saveChanges = (): void => {
		setIsSaving(true);
		const controller = new AbortController();
		const rows = apiRef.current.getSortedRows() as DefectDisplayRow[];
		saveDefectDisplayList(
			controller.signal,
			rows.map((value) => {
				return { name: value.name, color: value.color };
			}),
		)
			.then(() => {
				setSuccessOpen(true);
			})
			.catch((error) => {
				if (error.name === "AbortError") return;
				setFailureOpen(true);
			})
			.finally(() => {
				setIsSaving(false);
			});
	};

	return (
		<Box sx={{ height: "100%" }}>
			<DataGridPro
				apiRef={apiRef}
				columns={tooltipColumns}
				columnHeaderHeight={20}
				disableColumnMenu
				disableMultipleRowSelection
				getRowId={(row) => row.filterNo}
				localeText={sortToolTipText}
				hideFooter
				hideFooterSelectedRowCount
				rows={defectDisplayRowList}
				rowHeight={20}
				sx={{
					height: "100%",
					border: 0,
					"& .MuiDataGrid-cell:has(.Mui-error)": {
						// Mui-errorクラス要素を持つMuiDataGrid-cellクラス要素
						backgroundColor: "error.main",
					},
				}}
			/>
			<Box
				justifyContent="right"
				sx={{ height: 48, display: "flex", alignItems: "center" }}
			>
				<PrimaryButton
					loading={isSaving}
					onClick={saveChanges}
					startIcon={<SaveIcon />}
					loadingPosition="start"
				>
					<span>Save</span>
				</PrimaryButton>
				<ToastAlert
					opened={successOpen}
					setOpened={setSuccessOpen}
					severity="success"
				>
					Display settings saved
				</ToastAlert>
				<ToastAlert
					opened={failureOpen}
					setOpened={setFailureOpen}
					severity="error"
				>
					Failed to save display settings
				</ToastAlert>
			</Box>
		</Box>
	);
};
