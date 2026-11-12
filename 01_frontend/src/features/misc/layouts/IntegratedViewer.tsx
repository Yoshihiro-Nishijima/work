import "allotment/dist/style.css";

import MonitorIcon from "@mui/icons-material/Monitor";
import { AppBar, Box } from "@mui/material";
import { Allotment } from "allotment";
import { useCallback, useEffect, useState } from "react";

import { INTEGRATED_VIEWER_PATH } from "~/config";
import { IntegratedMapAndDefectDetails } from "~/features/defect-histogram/layouts/IntegratedMapAndDefectDetails";
import { IntegratedMapInfo } from "~/features/integrated-viewer-map-info/layouts/IntegratedMapInfo";
import { ColorMap } from "~/features/integrated-viewer-map/components/ColorMap";
import { ColorMapSettingsDialog } from "~/features/integrated-viewer-map/components/ColorMapSettingsDialog";
import { InspectionInfo } from "~/features/integrated-viewer-map/components/InspectionInfo";
import {
	INTEGRATED_VIEWER_MAP_INFO_WIDTH,
	INTEGRATED_VIEWER_MAP_TITLEBAR_HEIGHT,
	INTEGRATED_VIEWER_MENU_WIDTH,
	useMapAreaInfo,
} from "~/features/integrated-viewer-map/hooks/useMapAreaInfo";
import {
	type ColorMapSettings,
	DEFAULT_COLOR_MAP_SETTINGS,
} from "~/features/integrated-viewer-map/utils/colorMap";
import { IntegratedMenu } from "~/features/integrated-viewer-menu/layouts/IntegratedMenu";
import { IntegratedSFovViewModal } from "~/features/integrated-viewer-sfov-view/layouts/IntegratedSFovViewModal";
import { useSelectedSFovListForTrainingModel } from "~/features/training-mode/hooks/useSelectedSFovListForTrainingModel";

import { useReviewModal } from "~/features/training-mode-sfov-view/hooks/useReviewModal";
import { ReviewModal } from "~/features/training-mode-sfov-view/layouts/ReviewModal";
import { getPathParams } from "~/utils/urlUtils";
import { UserMenuBar } from "../../users/layouts/UserMenuBar";
import { useResultName } from "../hooks/useResultName";
import { useSelectedSFovImageIdList } from "../hooks/useSelectedSFovImageIdList";
import { INTEGRATED_VIEWER_INFO_AREA_HEIGHT } from "./integratedViewerLayout";

function getResultName(): string {
	// URLパス /integrated-viewer/{ResultName} から Resultname を取得
	const pathParams = getPathParams(`${INTEGRATED_VIEWER_PATH}/`);
	return pathParams.length > 0 ? pathParams[0] : "";
}

const IntegratedViewer = (): JSX.Element => {
	const { resultName, setResultName } = useResultName();
	const { integratedMapAreaWidth, integratedMapAreaHeight } = useMapAreaInfo();
	const [isShowHeatMap, setIsShowHeatMap] = useState(false);
	const [heatMapResultName, setHeatMapResultName] = useState(resultName);
	const [colorMapSettings, setColorMapSettings] = useState<ColorMapSettings>(
		DEFAULT_COLOR_MAP_SETTINGS,
	);
	const [isColorMapSettingsOpen, setIsColorMapSettingsOpen] = useState(false);
	const [heatMapMaxChipCount, setHeatMapMaxChipCount] = useState<{
		resultName: string;
		maxChipCount: number;
	} | null>(null);
	const [manualMaxResultName, setManualMaxResultName] = useState<string | null>(
		null,
	);
	const isCurrentHeatMapResult = heatMapResultName === resultName;
	const showHeatMap = isCurrentHeatMapResult && isShowHeatMap;
	const maxChipCount =
		heatMapMaxChipCount?.resultName === resultName
			? heatMapMaxChipCount.maxChipCount
			: null;
	const colorMapSettingsForResult =
		manualMaxResultName === resultName
			? colorMapSettings
			: {
					...colorMapSettings,
					maxCount: Math.max(maxChipCount ?? 0, 1),
				};
	const handleIsShowHeatMapChange = useCallback((nextValue: boolean) => {
		setIsShowHeatMap(nextValue);
	}, []);
	const handleMaxChipCountReady = useCallback(
		(reportedResultName: string, reportedMaxChipCount: number) => {
			if (reportedResultName !== resultName) return;
			setHeatMapMaxChipCount({
				resultName: reportedResultName,
				maxChipCount: reportedMaxChipCount,
			});
		},
		[resultName],
	);
	const handleApplyColorMapSettings = useCallback(
		(nextSettings: ColorMapSettings) => {
			if (nextSettings.maxCount !== colorMapSettingsForResult.maxCount) {
				setManualMaxResultName(resultName);
			}
			setColorMapSettings(nextSettings);
		},
		[colorMapSettingsForResult.maxCount, resultName],
	);

	const { addById } = useSelectedSFovImageIdList();
	const { selectedSFovListForTrainingModel } =
		useSelectedSFovListForTrainingModel();
	const { isReviewModalOpen } = useReviewModal();

	document.title = "IntegratedViewer";

	useEffect(() => {
		setResultName(getResultName());
	}, [setResultName]);

	useEffect(() => {
		if (isCurrentHeatMapResult) return;
		setHeatMapResultName(resultName);
		setIsShowHeatMap(false);
		setManualMaxResultName(null);
		setIsColorMapSettingsOpen(false);
	}, [isCurrentHeatMapResult, resultName]);

	useEffect(() => {
		if (maxChipCount === 0) setIsColorMapSettingsOpen(false);
	}, [maxChipCount]);

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
						<Box
							sx={{
								height: `calc(100% - ${INTEGRATED_VIEWER_MAP_TITLEBAR_HEIGHT}px)`,
							}}
						>
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
									<Box
										sx={{
											display: "flex",
											flexDirection: "column",
											height: "100%",
											minHeight: 0,
										}}
									>
										<Box sx={{ flex: 1, minHeight: 0, position: "relative" }}>
											<IntegratedMapAndDefectDetails
												isShowHeatMap={isShowHeatMap}
												showHeatMap={showHeatMap}
												onIsShowHeatMapChange={handleIsShowHeatMapChange}
												onMaxChipCountReady={handleMaxChipCountReady}
												colorMapSettings={colorMapSettingsForResult}
												mapAreaHeight={integratedMapAreaHeight}
											/>
										</Box>
										<Box
											sx={{
												display: "flex",
												alignItems: "stretch",
												gap: 2,
												height: INTEGRATED_VIEWER_INFO_AREA_HEIGHT,
												flexShrink: 0,
												boxSizing: "border-box",
												pl: 1,
												pr: 0,
												py: 0.25,
											}}
										>
											<Box
												sx={{
													flex: "0 1 480px",
													maxWidth: 480,
													minWidth: 0,
													height: "100%",
													alignSelf: "stretch",
													display: "flex",
													flexDirection: "column",
													alignItems: "stretch",
													justifyContent: "flex-start",
													paddingTop: 0,
													marginTop: 0,
												}}
											>
												<ColorMap
													showHeatMap={showHeatMap}
													settings={colorMapSettingsForResult}
													maxChipCount={maxChipCount}
													onOpenSettings={() => {
														if (maxChipCount != null && maxChipCount > 0) {
															setIsColorMapSettingsOpen(true);
														}
													}}
												/>
											</Box>
											<Box
												sx={{
													flex: "1 1 0%",
													minWidth: 0,
													height: "100%",
													alignSelf: "stretch",
													display: "flex",
													flexDirection: "column",
													alignItems: "flex-end",
													justifyContent: "flex-start",
													boxSizing: "border-box",
													padding: 0,
													paddingTop: 0,
													marginTop: 0,
												}}
											>
												<InspectionInfo />
											</Box>
										</Box>
									</Box>
								</Allotment.Pane>
								<Allotment.Pane
									maxSize={INTEGRATED_VIEWER_MAP_INFO_WIDTH}
									minSize={INTEGRATED_VIEWER_MAP_INFO_WIDTH}
								>
									{/* Map付帯情報エリア */}
									<IntegratedMapInfo />
								</Allotment.Pane>
							</Allotment>
						</Box>
					</Allotment.Pane>
				</Allotment>
				<ColorMapSettingsDialog
					open={isColorMapSettingsOpen}
					settings={colorMapSettingsForResult}
					onClose={() => setIsColorMapSettingsOpen(false)}
					onApply={handleApplyColorMapSettings}
				/>
				{/* sFOV View エリア(ModalWindowのためデフォルトは非表示) */}
				<Box sx={{ display: "none", width: 0, hight: 0 }}>
					{isReviewModalOpen ? <ReviewModal /> : <IntegratedSFovViewModal />}
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
