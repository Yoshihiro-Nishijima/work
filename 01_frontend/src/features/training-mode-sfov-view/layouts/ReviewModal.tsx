import "allotment/dist/style.css";

import { Box, Stack } from "@mui/material";
import Modal from "@mui/material/Modal";
import { Allotment } from "allotment";

import {
	INTEGRATED_VIEWER_MAP_INFO_WIDTH,
	INTEGRATED_VIEWER_MAP_TITLEBAR_HEIGHT,
} from "~/features/integrated-viewer-map/hooks/useMapAreaInfo";
import { useSFovViewModal } from "~/features/integrated-viewer-sfov-view/hooks/useSFovViewModal";
import { SFovViewImage } from "~/features/s-fov-image/layouts/SFovViewImage";

import { useEffect } from "react";
import { useDefect } from "~/features/info-and-defect/hooks/useDefect";
import { TitleBarWithCloseButton } from "~/features/integrated-viewer-sfov-view/components/TitleBarWithCloseButton";
import { SFovViewMap } from "~/features/map/layouts/SFovViewMap";
import { SFovInfoDataGrid } from "~/features/s-fov-info/components/SFovInfoDataGrid";
import { TrainingModeMenu } from "~/features/training-mode/components/TrainingModeMenu";
import { useReviewModal, useReviewSFov } from "../hooks/useReviewModal";

const sfovModalStyle = {
	position: "absolute" as const,
	top: `${INTEGRATED_VIEWER_MAP_TITLEBAR_HEIGHT}px`,
	width: "100%",
	height: "100vh",
	border: "2px solid #000",
};

export const ReviewModal = (): JSX.Element => {
	const { isSFovViewModalOpen } = useSFovViewModal();
	const { setReviewModalOpen } = useReviewModal();
	const { clearHistory } = useReviewSFov();
	const { setDefect } = useDefect();

	const handleClickSFovViewModalClose = (): void => {
		setReviewModalOpen(false);
		clearHistory();
	};

	useEffect(() => {
		setDefect();
	}, [setDefect]);

	return (
		<Modal
			open={isSFovViewModalOpen}
			aria-labelledby="sFOV-View-title"
			aria-describedby="sFOV-View-description"
			sx={sfovModalStyle}
		>
			<Box
				sx={{
					height: `calc(100vh - ${INTEGRATED_VIEWER_MAP_TITLEBAR_HEIGHT}px)`,
					width: "100%",
				}}
			>
				<TitleBarWithCloseButton
					title="Training Mode  --- Review ---"
					onClickEvent={handleClickSFovViewModalClose}
				/>
				<Allotment defaultSizes={[300, 700, INTEGRATED_VIEWER_MAP_INFO_WIDTH]}>
					<Allotment.Pane>
						<TrainingModeMenu />
					</Allotment.Pane>
					<Allotment.Pane maxSize={Number.POSITIVE_INFINITY}>
						<SFovViewImage />
					</Allotment.Pane>
					<Allotment.Pane
						maxSize={INTEGRATED_VIEWER_MAP_INFO_WIDTH}
						minSize={INTEGRATED_VIEWER_MAP_INFO_WIDTH}
					>
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
						</Box>
					</Allotment.Pane>
				</Allotment>
			</Box>
		</Modal>
	);
};
