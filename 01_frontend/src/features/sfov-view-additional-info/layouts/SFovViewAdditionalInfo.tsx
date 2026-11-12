// SFOV View 付帯情報エリア(Defectリスト・Map情報・sFOV情報)の管理

import "allotment/dist/style.css";

import { Box, Stack } from "@mui/material";
import { Allotment } from "allotment";

import { SFovViewDefect } from "~/features/info-and-defect/layouts/SFovViewDefect";
import { INTEGRATED_VIEWER_MAP_TITLEBAR_HEIGHT } from "~/features/integrated-viewer-map/hooks/useMapAreaInfo";
import { SFovViewMap } from "~/features/map/layouts/SFovViewMap";

import { SFovInfoDataGrid } from "~/features/s-fov-info/components/SFovInfoDataGrid";
import { TestRunButton } from "../components/TestRunButton";

export const SFovViewAdditionalInfo = (): JSX.Element => {
	return (
		<Box
			sx={{
				height: `calc(100vh - ${INTEGRATED_VIEWER_MAP_TITLEBAR_HEIGHT}px)`,
				width: "100%",
			}}
		>
			<Allotment defaultSizes={[350, 200]}>
				<Allotment.Pane minSize={20} maxSize={1000}>
					<SFovViewDefect />
				</Allotment.Pane>
				<Allotment.Pane minSize={200} maxSize={200}>
					<Box
						sx={{
							position: "fixed",
							right: 0,
							// タイトルバー ＋ TitleBarWithCloseButton の高さ 30
							top: INTEGRATED_VIEWER_MAP_TITLEBAR_HEIGHT + 30,
							bottom: 0,
							display: "flex",
							flexDirection: "column",
							backgroundColor: "white",
						}}
					>
						<Stack
							sx={{
								width: "100%",
								flexGrow: 1,
								overflow: "hidden",
							}}
						>
							<SFovViewMap />
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
								<SFovInfoDataGrid />
							</Box>
						</Stack>
						{/* 付帯情報フッター */}
						<Box sx={{ borderTop: 1, borderColor: "text.disabled" }}>
							<TestRunButton />
						</Box>
					</Box>
				</Allotment.Pane>
			</Allotment>
		</Box>
	);
};
