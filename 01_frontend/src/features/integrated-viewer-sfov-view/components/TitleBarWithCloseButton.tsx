import CloseIcon from "@mui/icons-material/Close";
import { IconButton, Typography } from "@mui/material";
import { Box, type SxProps, type Theme } from "@mui/system";

export interface TitleBarWithCloseButtonProp {
	title: string;
	sx?: SxProps<Theme>;
	onClickEvent: () => void;
}

export const TitleBarWithCloseButton = ({
	title,
	sx,
	onClickEvent,
}: TitleBarWithCloseButtonProp): JSX.Element => {
	return (
		<Box
			sx={{
				width: "100%",
				height: 30,
				color: "white",
				backgroundColor: "primary.main",
				borderTopStyle: "solid",
				borderTopColor: "primary.dark",
				display: "flex",
				flexDirection: "row",
				justify: "center",
				...sx,
			}}
		>
			<Typography align="left" marginLeft={1} flexGrow={1}>
				{title}
			</Typography>
			<IconButton size="small" onClick={onClickEvent}>
				<CloseIcon />
			</IconButton>
		</Box>
	);
};
