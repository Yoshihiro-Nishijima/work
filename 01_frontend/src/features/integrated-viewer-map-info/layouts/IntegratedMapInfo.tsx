import "allotment/dist/style.css";

import { Box, Stack } from "@mui/material";

import {
	INTEGRATED_VIEWER_MAP_INFO_WIDTH,
	INTEGRATED_VIEWER_MAP_TITLEBAR_HEIGHT,
} from "~/features/integrated-viewer-map/hooks/useMapAreaInfo";
import { SFovInfoDataGrid } from "~/features/s-fov-info/components/SFovInfoDataGrid";
import { useFovList } from "~/features/s-fov-list/hooks/useFovList";
import { ChipMap } from "../components/ChipMap";
import { ControlButton } from "../components/ControlButton";
import { DefectInfoDataGrid } from "../components/DefectInfoDataGrid";
import { DefectThumbnail } from "../components/DefectThumbnail";
import { WaferMap } from "../components/WaferMap";

interface IntegratedViewerProps {
	hiddenControlBtn?: boolean;
	hiddenDefectThumbnail?: boolean;
}

export const IntegratedMapInfo = ({
	hiddenControlBtn = false,
	hiddenDefectThumbnail = false,
}: IntegratedViewerProps): JSX.Element => {
	const { selectedFov } = useFovList();

	return (
		<Box
			sx={{
				position: "fixed",
				right: 0,
				top: INTEGRATED_VIEWER_MAP_TITLEBAR_HEIGHT,
				bottom: 0,
				display: "flex",
				flexDirection: "column",
				width: INTEGRATED_VIEWER_MAP_INFO_WIDTH,
				maxWidth: INTEGRATED_VIEWER_MAP_INFO_WIDTH,
				minWidth: INTEGRATED_VIEWER_MAP_INFO_WIDTH,
			}}
		>
			<Stack
				sx={{
					width: "100%",
					flexGrow: 1,
					overflow: "hidden",
				}}
			>
				<WaferMap />
				<ChipMap />
				<hr style={{ width: "95%", borderTop: "3px solid" }} />
				{!hiddenDefectThumbnail && selectedFov == null ? (
					<DefectThumbnail />
				) : (
					<></>
				)}
				<Box
					sx={{
						width: "100%",
						flexGrow: 1,
						overflow: "auto",
						scrollbarWidth: "thin", // Firefox用
						"&::-webkit-scrollbar": {
							width: "8px", // Chrome/Safari用
						},
					}}
				>
					{!hiddenDefectThumbnail && selectedFov == null ? (
						<DefectInfoDataGrid />
					) : (
						<SFovInfoDataGrid />
					)}
				</Box>
			</Stack>
			{!hiddenControlBtn && <ControlButton />}
		</Box>
	);
};
