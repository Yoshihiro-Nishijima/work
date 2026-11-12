import BorderAllIcon from "@mui/icons-material/BorderAll";
import { Tooltip } from "@mui/material";
import { Box } from "@mui/system";
import {
	MAP_DRAW_SFOV_THUMBNAIL,
	isSFovThumbnailDisplayLevel,
} from "../hooks/useMapInfo";
import { useSfovBorderDisplay } from "../hooks/useSfovBorderDisplay";
import { MapViewToggle } from "./MapViewToggle";

const tooltipDisabledText = `Magnification is too low. Active from more than x${MAP_DRAW_SFOV_THUMBNAIL}.`;

interface BorderToggleProps {
	inToolbar?: boolean;
}

export const BorderToggle = ({ inToolbar = false }: BorderToggleProps): JSX.Element => {
	const { isSfovBorderDisplay, setIsSfovBorderDisplay } =
		useSfovBorderDisplay();
	const isDisabled = !isSFovThumbnailDisplayLevel();
	const tooltipText = isDisabled ? tooltipDisabledText : "";

	const handleChangeBorderSelected = (): void => {
		setIsSfovBorderDisplay((prev) => !prev);
	};

	return (
		<Tooltip title={tooltipText}>
			<Box
				sx={{
					...(inToolbar
						? {}
						: {
								position: "absolute",
								left: "77%",
								bottom: "94%",
							}),
					background: "rgba(255, 255, 255, 1)",
					borderRadius: "5px",
					padding: "0px",
				}}
			>
				<MapViewToggle
					title="Border"
					toggleIcon={<BorderAllIcon sx={{ mx: 0, p: 0 }} />}
					isSelected={isDisabled ? false : isSfovBorderDisplay}
					isDisabled={isDisabled}
					value="Border"
					handleChangeToggleEvent={handleChangeBorderSelected}
				/>
			</Box>
		</Tooltip>
	);
};
