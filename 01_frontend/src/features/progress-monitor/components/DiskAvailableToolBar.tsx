import Box from "@mui/material/Box";
import {
	GridToolbarColumnsButton,
	GridToolbarContainer,
	GridToolbarFilterButton,
} from "@mui/x-data-grid-pro";
import { memo } from "react";
import { DiskAvailable } from "./DiskAvailable";

interface DiskAvailableToolBarProps {
	hiddenColumnsButton?: boolean;
	hiddenFilterButton?: boolean;
	additionalButton?: JSX.Element;
}

export const DiskAvailableToolBar = memo(
	({
		hiddenColumnsButton = false,
		hiddenFilterButton = false,
		additionalButton = undefined,
	}: DiskAvailableToolBarProps): JSX.Element => {
		return (
			<GridToolbarContainer
				sx={{
					display: "flex",
					alignItems: "center",
					gap: 1,
				}}
			>
				{!hiddenColumnsButton && <GridToolbarColumnsButton />}
				{!hiddenFilterButton && (
					<GridToolbarFilterButton
						PopperProps={{
							sx: {
								"& .MuiTooltip-tooltip": {
									fontSize: "1em",
								},
							},
						}}
					/>
				)}
				{additionalButton}
				<Box sx={{ ml: "auto" }}>
					<DiskAvailable />
				</Box>
			</GridToolbarContainer>
		);
	},
);
