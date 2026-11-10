import "allotment/dist/style.css";

import MonitorIcon from "@mui/icons-material/Monitor";
import { AppBar, Box } from "@mui/material";
import { Allotment } from "allotment";
import { useEffect } from "react";

import { INTEGRATED_VIEWER_PATH } from "~/config";
import { IntegratedMapInfo } from "~/features/integrated-viewer-map-info/layouts/IntegratedMapInfo";
import {
	INTEGRATED_VIEWER_MAP_INFO_WIDTH,
	INTEGRATED_VIEWER_MAP_TITLEBAR_HEIGHT,
	INTEGRATED_VIEWER_MENU_WIDTH,
	useMapAreaInfo,
} from "~/features/integrated-viewer-map/hooks/useMapAreaInfo";

import { IntegratedMapAndDefectDetails } from "~/features/defect-histogram/layouts/IntegratedMapAndDefectDetails";
import { IntegratedMenu } from "~/features/integrated-viewer-menu/layouts/IntegratedMenu";
import { IntegratedSFovViewModal } from "~/features/integrated-viewer-sfov-view/layouts/IntegratedSFovViewModal";
import { useSelectedSFovListForTrainingModel } from "~/features/training-mode/hooks/useSelectedSFovListForTrainingModel";

import { useReviewModal } from "~/features/training-mode-sfov-view/hooks/useReviewModal";
import { ReviewModal } from "~/features/training-mode-sfov-view/layouts/ReviewModal";
import { getPathParams } from "~/utils/urlUtils";
import { UserMenuBar } from "../../users/layouts/UserMenuBar";
import { useResultName } from "../hooks/useResultName";
import { useSelectedSFovImageIdList } from "../hooks/useSelectedSFovImageIdList";

import { DefectRangeHistogramModal } from "~/features/defect-range-histogram/layouts/DefectRangeHistogramModal";

function getResultName(): string {
	// URLパス /integrated-viewer/{ResultName} から Resultname を取得
	const pathParams = getPathParams(`${INTEGRATED_VIEWER_PATH}/`);
	return pathParams.length > 0 ? pathParams[0] : "";
}

const IntegratedViewer = (): JSX.Element => {
	const { resultName, setResultName } = useResultName();
	const { integratedMapAreaWidth } = useMapAreaInfo();

	const { addById } = useSelectedSFovImageIdList();
	const { selectedSFovListForTrainingModel } =
		useSelectedSFovListForTrainingModel();
	const { isReviewModalOpen } = useReviewModal();

	document.title = "IntegratedViewer";

	useEffect(() => {
		setResultName(getResultName());
	}, [setResultName]);

	useEffect(() => {
		addById(selectedSFovListForTrainingModel);
	}, [selectedSFovListForTrainingModel, addById]);

	if (resultName.length === 0) return <></>;
	// SFovViewについてはModalWindowとして、初期状態は非表示
	return (
		<>
			<Box sx={{ height: "100vh", width: "100vw" }}>
				<Allotment>
					<Allotment.Pane>
						<AppBar
							position="fixed"
							sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}
						>
							<Box
								sx={{
									border: "1px solid",
									height: 32,
									width: "100%",
									p: 1,
									verticalAlign: "center",
								}}
							>
								<MonitorIcon fontSize="small" sx={{ mr: 1 }} />
								IntegratedViewer (ResultName : {getResultName()} ){" "}
							</Box>
						</AppBar>
						<Box height={INTEGRATED_VIEWER_MAP_TITLEBAR_HEIGHT} />
						<Allotment
							maxSize={300}
							minSize={100}
							defaultSizes={[
								INTEGRATED_VIEWER_MENU_WIDTH,
								integratedMapAreaWidth,
								INTEGRATED_VIEWER_MAP_INFO_WIDTH,
							]}
						>
							<Allotment.Pane
								minSize={INTEGRATED_VIEWER_MENU_WIDTH}
								maxSize={INTEGRATED_VIEWER_MENU_WIDTH}
							>
								{/* 操作メニュー・List部エリア */}
								<IntegratedMenu />
							</Allotment.Pane>
							<Allotment.Pane
								maxSize={integratedMapAreaWidth}
								preferredSize={integratedMapAreaWidth}
							>
								{/* Mapエリア */}
								<IntegratedMapAndDefectDetails />
							</Allotment.Pane>
							<Allotment.Pane
								maxSize={INTEGRATED_VIEWER_MAP_INFO_WIDTH}
								minSize={INTEGRATED_VIEWER_MAP_INFO_WIDTH}
							>
								{/* Map付帯情報エリア */}
								<IntegratedMapInfo />
							</Allotment.Pane>
						</Allotment>
					</Allotment.Pane>
				</Allotment>
				{/* sFOV View エリア(ModalWindowのためデフォルトは非表示) */}
				<Box sx={{ display: "none", width: 0, hight: 0 }}>
					{isReviewModalOpen ? <ReviewModal /> : <IntegratedSFovViewModal />}
				</Box>
				{/* DefectRangeHistogram エリア(ModalWindowのためデフォルトは非表示) */}
				<Box sx={{ display: "none", width: 0, height: 0 }}>
					<DefectRangeHistogramModal />
				</Box>
			</Box>
			<UserMenuBar
				top={-2}
				sx={{ zIndex: (theme) => theme.zIndex.drawer + 2 }}
			/>
		</>
	);
};
export default IntegratedViewer;
