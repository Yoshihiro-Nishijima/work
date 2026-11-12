import GpsFixedIcon from "@mui/icons-material/GpsFixed";
import { Box, IconButton, type SxProps, Tooltip } from "@mui/material";

import { useMapDisplay } from "~/features/integrated-viewer-map/hooks/useMapInfo";

const positionBoxSx: SxProps = {
	position: "absolute",
	borderRadius: "5px",
	padding: "0px",
	width: "50px",
	border: "1px solid rgba(0, 0, 0, 0.12)",
};

const positionButtonSx: SxProps = {
	display: "flex",
	flexDirection: "row",
	justifyContent: "center",
	margin: "0px",
	padding: "0px",
	width: "50px",
	minWidth: "50px",
	textTransform: "none",
};

interface PositionButtonProp {
	bottom: string;
	right: string;
	disabled?: boolean;
}

export const PositionButton = ({
	bottom,
	right,
	disabled = false,
}: PositionButtonProp): JSX.Element => {
	const { enableMoveSelectedObjPoint, moveSelectedObjPoint } = useMapDisplay();
	const handleClickPosition = (): void => {
		moveSelectedObjPoint();
	};
	const buttonDisabled = disabled || !enableMoveSelectedObjPoint;
	const positionBoxBackGroundColor = buttonDisabled
		? "rgba(0, 0, 0, 0.1)"
		: "rgba(0, 0, 0, 0.5)";
	const positionButtonColor = buttonDisabled
		? "rgba(255, 255, 255, 0.1)"
		: "rgba(255, 255, 255, 1)";

	return (
		<Box
			sx={{
				...positionBoxSx,
				right: { right },
				bottom: { bottom },
				background: positionBoxBackGroundColor,
			}}
		>
			<Tooltip title="Move SelectFov/Defect Position" arrow placement="top">
				{/* spanがないとtooltipが表示されない */}
				<span>
					<IconButton
						disabled={buttonDisabled}
						onClick={handleClickPosition}
						color="primary"
						sx={positionButtonSx}
					>
						<GpsFixedIcon sx={{ color: positionButtonColor }} />
					</IconButton>
				</span>
			</Tooltip>
		</Box>
	);
};
