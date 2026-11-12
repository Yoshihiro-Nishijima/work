// Map View Toggleコンポーネント
import CheckIcon from "@mui/icons-material/Check";
import { Stack, ToggleButton, Typography } from "@mui/material";
import type { SxProps, Theme } from "@mui/material/styles";

export interface MapvViewToggleButtonProps {
	title: string;
	toggleIcon: JSX.Element;
	isSelected: boolean;
	isDisabled: boolean;
	value: string;
	handleChangeToggleEvent: (e: React.MouseEvent, value: string) => void;
	sx?: SxProps<Theme>;
}

export const MapViewToggle = ({
	title,
	toggleIcon,
	isSelected,
	isDisabled,
	value,
	handleChangeToggleEvent,
	sx,
}: MapvViewToggleButtonProps): JSX.Element => {
	// sx設定
	const toggleButtonStyle = {
		display: "flex",
		flexDirection: "row",
		justifyContent: "start",
		margin: 0,
		height: 31,
		width: 130,
	};

	// Toggleボタン描画
	return (
		<ToggleButton
			title={title}
			selected={isSelected}
			disabled={isDisabled}
			value={value}
			onChange={handleChangeToggleEvent}
			color="primary"
			sx={sx == null ? toggleButtonStyle : [toggleButtonStyle, sx]}
		>
			<Stack direction="row" sx={{ alignItems: "center" }}>
				{isSelected ? (
					<CheckIcon />
				) : (
					<CheckIcon sx={{ visibility: "hidden" }} />
				)}
				{toggleIcon}
				<Typography sx={{ textTransform: "none" }}>{title}</Typography>
			</Stack>
		</ToggleButton>
	);
};
