import { Box } from "@mui/material";
import {
	type GridColDef,
	GridToolbarColumnsButton,
	GridToolbarContainer,
	GridToolbarFilterButton,
} from "@mui/x-data-grid-pro";
import { SortButton } from "~/components/elements/DataGrid/SortButton";
import { useDatasetDefect } from "../hooks/useDatasetDefect";

export const ADCDataGridToolbar = (columns: GridColDef[]): JSX.Element => {
	const { sort, setSort } = useDatasetDefect();
	return (
		<GridToolbarContainer>
			<Box sx={{ display: "flex" }}>
				<GridToolbarColumnsButton />
				<GridToolbarFilterButton
					PopperProps={{
						sx: {
							"& .MuiTooltip-tooltip": {
								fontSize: "1em",
							},
						},
					}}
				/>
				<SortButton columns={columns} sort={sort} setSort={setSort} />
			</Box>
		</GridToolbarContainer>
	);
};
