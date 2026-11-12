// SFOV View Toggleコンポーネント
import CheckIcon from "@mui/icons-material/Check";
import { Stack, ToggleButton, Typography } from "@mui/material";

export interface SFovViewToggleButtonProps {
	title: string;
	toggleIcon: JSX.Element;
	isSelected: boolean;
	isDisabled: boolean;
	value: string;
	handleChangeToggleEvent: (e: React.MouseEvent, value: string) => void;
}

export const SFovViewToggle = ({
	title,
	toggleIcon,
	isSelected,
	isDisabled,
	value,
	handleChangeToggleEvent,
}: SFovViewToggleButtonProps): JSX.Element => {
	// sx設定
	const toggleButtonStyle = {
		display: "flex",
		flexDirection: "row",
		justifyContent: "start",
		margin: 1,
		height: 36,
		width: 160,
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
			sx={toggleButtonStyle}
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
