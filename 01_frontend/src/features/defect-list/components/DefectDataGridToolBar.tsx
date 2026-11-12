import GridViewIcon from "@mui/icons-material/GridView";
import ListAltIcon from "@mui/icons-material/ListAlt";
import SplitscreenIcon from "@mui/icons-material/Splitscreen";
import { Box, ToggleButton, ToggleButtonGroup } from "@mui/material";
import {
	type GridColDef,
	GridToolbarColumnsButton,
	GridToolbarFilterButton,
} from "@mui/x-data-grid-pro";
import { SortButton } from "~/components/elements/DataGrid/SortButton";
import { useDefect } from "../hooks/useDefect";
import { useDefectListView } from "../hooks/useDefectListView";

export const DefectDataGridToolBar = (columns: GridColDef[]): JSX.Element => {
	const { sort, setSort } = useDefect();
	const { defectListView, setDefectListView } = useDefectListView();
	const handleChange = (
		_event: React.MouseEvent<HTMLElement, MouseEvent>,
		newListView: "list" | "thumbnailList" | "thumbnail",
	): void => {
		if (newListView != null) {
			setDefectListView(newListView);
		}
	};

	return (
		<Box sx={{ display: "flex", gap: 2 }}>
			<ToggleButtonGroup
				value={defectListView}
				exclusive
				onChange={handleChange}
			>
				<ToggleButton value="list">
					<ListAltIcon />
				</ToggleButton>
				<ToggleButton value="thumbnailList">
					<SplitscreenIcon />
				</ToggleButton>
				<ToggleButton value="thumbnail">
					<GridViewIcon />
				</ToggleButton>
			</ToggleButtonGroup>
			{defectListView !== "thumbnail" && <GridToolbarColumnsButton />}
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
	);
};
