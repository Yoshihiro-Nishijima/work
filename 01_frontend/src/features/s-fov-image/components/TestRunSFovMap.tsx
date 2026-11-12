import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { Box, IconButton, Stack, Typography } from "@mui/material";
import { useState } from "react";

import { MemorizedSFovMap } from "~/features/map/components/SFovMap";

// sFovMap内に配置するマップの横幅（画像サイズの計算にも使用する）
const AREA_WIDTH = 150;
// sFovMapのツールバーの高さ
const TOOLBAR_HEIGHT = 28;
// sFovMapのBorder幅
const BORDER_SIZE = 1;

export const TestRunSFovMap = (): JSX.Element => {
	const [isSFovMapOpen, setIsSFovMapOpen] = useState(true);
	const toggleSFovMapOpen = (): void => {
		setIsSFovMapOpen((prev) => !prev);
	};

	return (
		<Stack
			sx={{
				width: AREA_WIDTH + BORDER_SIZE * 2,
				border: BORDER_SIZE,
				borderColor: "primary.main",
			}}
		>
			<div style={{ width: AREA_WIDTH }}>
				<div style={{ display: isSFovMapOpen ? "" : "none" }}>
					{/* TestRunのSFovMapのHeightは画像サイズに合わせて計算するので0指定 */}
					<MemorizedSFovMap mapAreaWidth={AREA_WIDTH} mapAreaHeight={0} />
				</div>
			</div>
			<Box
				sx={{
					height: TOOLBAR_HEIGHT,
					width: AREA_WIDTH,
					color: "white",
					backgroundColor: "primary.main",
					display: "flex",
					flexDirection: "row",
					alignItems: "center",
				}}
			>
				<Typography ml={2}>sFov Map</Typography>
				<IconButton
					color="primary"
					style={{
						marginLeft: "auto",
						color: "white",
						transform: isSFovMapOpen ? "rotate(0deg)" : "rotate(180deg)",
					}}
					onClick={toggleSFovMapOpen}
				>
					<ExpandMoreIcon />
				</IconButton>
			</Box>
		</Stack>
	);
};
