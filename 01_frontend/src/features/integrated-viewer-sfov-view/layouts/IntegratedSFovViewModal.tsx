import "allotment/dist/style.css";

import { Box } from "@mui/material";
import Modal from "@mui/material/Modal";
import { Allotment } from "allotment";

import { INTEGRATED_VIEWER_MAP_TITLEBAR_HEIGHT } from "~/features/integrated-viewer-map/hooks/useMapAreaInfo";
import { useSFovViewModal } from "~/features/integrated-viewer-sfov-view/hooks/useSFovViewModal";
import { SFovViewImage } from "~/features/s-fov-image/layouts/SFovViewImage";
import { SFovViewAdditionalInfo } from "~/features/sfov-view-additional-info/layouts/SFovViewAdditionalInfo";

import { useSfovnoForSEMImage } from "~/features/map/hooks/useSfovnoForSEMImage";
import { useSetSEMImage } from "~/features/s-fov-image/hooks/useSEMImage";
import { TitleBarWithCloseButton } from "../components/TitleBarWithCloseButton";

const sfovModalStyle = {
	position: "absolute" as const,
	top: `${INTEGRATED_VIEWER_MAP_TITLEBAR_HEIGHT}px`,
	width: "100%",
	height: "100vh",
	border: "2px solid #000",
};

export const IntegratedSFovViewModal = (): JSX.Element => {
	const { isSFovViewModalOpen, updateSFovViewModalOpen } = useSFovViewModal();
	const { setSfovnoForSEMImage } = useSfovnoForSEMImage();
	const { reset } = useSetSEMImage();

	const handleClickSFovViewModalClose = (): void => {
		updateSFovViewModalOpen(false);
		setSfovnoForSEMImage(undefined);
		reset();
	};

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
					title="sFOV View Mode"
					onClickEvent={handleClickSFovViewModalClose}
				/>
				<Allotment defaultSizes={[1000, 600]}>
					<Allotment.Pane maxSize={Number.POSITIVE_INFINITY}>
						<SFovViewImage />
					</Allotment.Pane>
					<Allotment.Pane minSize={300} maxSize={1000}>
						<SFovViewAdditionalInfo />
					</Allotment.Pane>
				</Allotment>
			</Box>
		</Modal>
	);
};
