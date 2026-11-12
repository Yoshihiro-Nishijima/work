import SettingsIcon from "@mui/icons-material/Settings";
import { Box, Button, Stack, Tooltip, Typography } from "@mui/material";
import { toNumStr } from "~/utils/formatter";
import {
	getColorMapGradient,
	getColorMapTicks,
	type ColorMapSettings,
} from "../utils/colorMap";

interface ColorMapProps {
	showHeatMap: boolean;
	settings: ColorMapSettings;
	maxChipCount: number | null;
	onOpenSettings: () => void;
}

export const ColorMap = ({
	showHeatMap,
	settings,
	maxChipCount,
	onOpenSettings,
}: ColorMapProps): JSX.Element | null => {
	if (!showHeatMap) return null;

	return (
		<Box sx={{ width: "100%", maxWidth: 480, minWidth: 0 }}>
			<Stack direction="row" alignItems="center" spacing={1}>
				<Typography variant="subtitle2" sx={{ flex: 1 }}>
					Color Map
				</Typography>
				<Tooltip title="Color Map settings">
					<span>
						<Button
							aria-label="Color Map settings"
							size="small"
							startIcon={<SettingsIcon fontSize="small" />}
							disabled={maxChipCount == null || maxChipCount <= 0}
							onClick={onOpenSettings}
						>
							Setting
						</Button>
					</span>
				</Tooltip>
			</Stack>
			<Box
				role="img"
				aria-label="Color scale"
				sx={{
					height: 14,
					border: "1px solid",
					borderColor: "divider",
					background: getColorMapGradient(settings.presetId),
				}}
			/>
			{maxChipCount != null && (
				<Stack
					direction="row"
					justifyContent="space-between"
					aria-label="Color scale values"
				>
					{getColorMapTicks(
						maxChipCount === 0 ? 0 : settings.maxCount,
					).map((tick, index) => (
						<Typography
							key={`${index}-${tick}`}
							data-testid="color-map-tick"
							variant="caption"
						>
							{toNumStr(tick)}
						</Typography>
					))}
				</Stack>
			)}
		</Box>
	);
};