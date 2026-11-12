import CrisisAlertIcon from "@mui/icons-material/CrisisAlert";
import FactCheckIcon from "@mui/icons-material/FactCheck";
import ImageIcon from "@mui/icons-material/Image";
import {
	ButtonBase,
	ListItemIcon,
	ListItemText,
	Menu,
	MenuItem,
	Popper,
	Tooltip,
} from "@mui/material";
import { Box } from "@mui/system";
import { AppProvider, Stage } from "@pixi/react";
import * as PIXI from "pixi.js";
import { useCallback, useEffect, useRef, useState } from "react";
import { MAGNIFICATION_SLIDER_HEIGHT } from "~/components/elements/MagnificationSlider";
import { getTestRunURL } from "~/config";
import {
	useSetCategoryDefectClass,
	useSetMapChipFilter,
} from "~/features/defect-list/hooks/useDefect";
import type { MapChipFilter } from "~/features/defect-list/hooks/useDefect";
import { formatClassName } from "~/features/defect-list/utils/defectFormatters";
import { useHoverDefectClassCounts } from "~/features/integrated-viewer-map/hooks/useHoverDefectClassCounts";
import { useAutoSelectHighestAbnormalityDefect } from "~/features/integrated-viewer-map/hooks/useAutoSelectHighestAbnormalityDefect";
import { useSFovViewModal } from "~/features/integrated-viewer-sfov-view/hooks/useSFovViewModal";
import { useResultName } from "~/features/misc/hooks/useResultName";
import { useResultJobType } from "~/features/misc/hooks/useResultsJobType";
import { useSelectedDefect } from "~/features/misc/hooks/useSelectedDefect";
import type { Point } from "pixi.js";

import { useFovList } from "~/features/s-fov-list/hooks/useFovList";
import { BorderToggle } from "../components/BorderToggle";
import { Defect } from "../components/Defect";
import { DefectEmphasis } from "../components/DefectEmphasis";
import { DrawMFovHex } from "../components/DrawMFovHex";
import { HeatMapToggle } from "../components/HeatMapToggle";
import { InspectionArea } from "../components/InspectionArea";
import { IntegratedMapViewport } from "../components/IntegratedMapViewport";
import { MapNotification } from "../components/MapNotification";
import { MapScale } from "../components/MapScale";
import {
	MapSlider,
	SCALE_SLIDER_BOTTOM_HEIGHT,
	SCALE_SLIDER_RIGHT_WIDTH,
} from "../components/MapSlider";
import { MapViewToggle } from "../components/MapViewToggle";
import { Pin } from "../components/Pin";
import { PositionButton } from "../components/PositionButton";
import { SFov } from "../components/SFov";
import { SFovViewOpenModal } from "../components/SFovViewOpenModal";
import { SelectedChip } from "../components/SelectedChip";
import { WaferMap } from "../components/WaferMap";
import { useContextMenuDisplay } from "../hooks/useContextMenuDisplay";
import { useChipHeatMapCounts } from "../hooks/useChipHeatMapCounts";
import { useDisplayedDefect } from "../hooks/useDisplayedDefect";
import { useMapAreaInfo } from "../hooks/useMapAreaInfo";
import { useWaferMapInfo } from "../hooks/useMapInfo";
import {
	type ColorMapSettings,
} from "../utils/colorMap";
import type { HoverPointerPosition, MapRegionKind } from "../types";

const pixiApp = new PIXI.Application({});

/** glay色カラーコード */
const GLAY_COLOR = 0x808080;

/** PositionボタンのMapSlider基準のBottom位置(MapSliderの下端+MapSliderの高さ+MapSliderから何px離した位置に配置するか) */
const positionButtonBottom = `${SCALE_SLIDER_BOTTOM_HEIGHT + MAGNIFICATION_SLIDER_HEIGHT + 10}px`;
const positionButtonRight = `${SCALE_SLIDER_RIGHT_WIDTH}px`;

interface FixedCategoryPopup {
	id: number;
	regionKind: MapRegionKind;
	region: MapChipFilter;
	anchorPosition: HoverPointerPosition;
}

interface SelectedMapRegion {
	regionKind: MapRegionKind;
	region: MapChipFilter;
}

const isSameMapRegion = (
	left: SelectedMapRegion,
	rightRegionKind: MapRegionKind,
	rightRegion: MapChipFilter,
): boolean =>
	left.regionKind === rightRegionKind &&
	left.region.chipX === rightRegion.chipX &&
	left.region.chipY === rightRegion.chipY &&
	left.region.mFOVno === rightRegion.mFOVno &&
	left.region.sFOVno === rightRegion.sFOVno;

interface HoverDefectClassCountsPopperProps {
	region: MapChipFilter;
	pointerPosition: HoverPointerPosition;
	isFixed: boolean;
	onClose: () => void;
	shouldIgnoreOutsideClick: (event: MouseEvent) => boolean;
	onCategorySelect: (defectClass: number) => Promise<void>;
}

const HoverDefectClassCountsPopper = ({
	region,
	pointerPosition,
	isFixed,
	onClose,
	shouldIgnoreOutsideClick,
	onCategorySelect,
}: HoverDefectClassCountsPopperProps): JSX.Element => {
	const hoverCounts = useHoverDefectClassCounts(region);
	const popupRef = useRef<HTMLDivElement>(null);
	const [isSelectingCategory, setIsSelectingCategory] = useState(false);
	const positiveCounts =
		hoverCounts.status === "success"
			? hoverCounts.counts.filter((item) => item.count > 0)
			: [];
	const anchor = {
		getBoundingClientRect: () =>
			new DOMRect(pointerPosition.x, pointerPosition.y, 0, 0),
	};
	const handleCategorySelect = async (defectClass: number): Promise<void> => {
		if (!isFixed || isSelectingCategory) return;
		setIsSelectingCategory(true);
		try {
			await onCategorySelect(defectClass);
		} finally {
			setIsSelectingCategory(false);
			onClose();
		}
	};

	useEffect(() => {
		if (!isFixed) return;

		const handleClick = (event: MouseEvent): void => {
			if (
				event.target instanceof Node &&
				popupRef.current?.contains(event.target)
			) {
				return;
			}
			window.setTimeout(() => {
				if (shouldIgnoreOutsideClick(event)) return;
				onClose();
			}, 0);
		};
		const handleKeyDown = (event: KeyboardEvent): void => {
			if (event.key === "Escape") onClose();
		};

		document.addEventListener("click", handleClick);
		window.addEventListener("keydown", handleKeyDown);
		return () => {
			document.removeEventListener("click", handleClick);
			window.removeEventListener("keydown", handleKeyDown);
		};
	}, [isFixed, onClose, shouldIgnoreOutsideClick]);

	return (
		<Popper
			open={
				isFixed ||
				hoverCounts.status === "error" ||
				positiveCounts.length > 0
			}
			anchorEl={anchor}
			placement="top-start"
			modifiers={[{ name: "offset", options: { offset: [8, 8] } }]}
			style={{ pointerEvents: isFixed ? "auto" : "none" }}
		>
			<Box
				ref={popupRef}
				sx={{
					backgroundColor: "white",
					border: "1px solid #777",
					borderRadius: "1px",
					boxShadow: 2,
					fontSize: 12,
					lineHeight: 1.5,
					px: 0.75,
					py: 0.5,
					whiteSpace: "nowrap",
				}}
			>
				{hoverCounts.status === "error" && "取得失敗"}
				{positiveCounts.length > 0 && (
					<Box sx={{ display: "grid" }}>
						{positiveCounts.map((item) => {
							const label = `${formatClassName(item.defectClass)} ${item.count}`;
							return isFixed ? (
								<ButtonBase
									key={item.defectClass}
									disabled={isSelectingCategory}
									onClick={() => void handleCategorySelect(item.defectClass)}
									sx={{ justifyContent: "flex-start", fontSize: "inherit" }}
								>
									{label}
								</ButtonBase>
							) : (
								<Box key={item.defectClass}>{label}</Box>
							);
						})}
					</Box>
				)}
			</Box>
		</Popper>
	);
};

const DefectToggle = (): JSX.Element => {
	const { isDisplayedDefect, setIsDisplayedDefect } = useDisplayedDefect();
	const tooltipText = "";
	const handleChangeDefectSelected = (): void => {
		setIsDisplayedDefect(!isDisplayedDefect);
	};

	return (
		<Tooltip title={tooltipText}>
			<Box
				sx={{
					background: "rgba(255, 255, 255, 1)",
					borderRadius: "5px",
					padding: "0px",
				}}
			>
				<MapViewToggle
					title="Defect"
					toggleIcon={<CrisisAlertIcon sx={{ mx: 0, p: 0 }} />}
					isSelected={isDisplayedDefect}
					isDisabled={false}
					value="Defect"
					handleChangeToggleEvent={handleChangeDefectSelected}
				/>
			</Box>
		</Tooltip>
	);
};

export interface IntegratedMapProps {
	isShowHeatMap: boolean;
	showHeatMap: boolean;
	onIsShowHeatMapChange: (nextValue: boolean) => void;
	onMaxChipCountReady: (resultName: string, maxChipCount: number) => void;
	colorMapSettings: ColorMapSettings;
	mapAreaHeight: number;
}

export const IntegratedMap = ({
	isShowHeatMap,
	showHeatMap,
	onIsShowHeatMapChange,
	onMaxChipCountReady,
	colorMapSettings,
	mapAreaHeight,
}: IntegratedMapProps): JSX.Element => {
	const { enableDefect } = useResultJobType();
	const { isContextMenuDisplay, contextMenuPoint, setIsContextMenuDisplay } =
		useContextMenuDisplay();
	const { selectedFov } = useFovList();
	const { selectedDefect } = useSelectedDefect();
	const { resultName } = useResultName();
	const { enabledWaferColorMap } = useWaferMapInfo();
	const chipHeatMapCounts = useChipHeatMapCounts(showHeatMap);
	const isHeatMapVisible =
		showHeatMap &&
		chipHeatMapCounts.status === "success" &&
		chipHeatMapCounts.isReady &&
		enabledWaferColorMap;
	const [hoverRegion, setHoverRegion] = useState<MapChipFilter | null>(null);
	const [hoverPointerPosition, setHoverPointerPosition] =
		useState<HoverPointerPosition | null>(null);
	const [fixedCategoryPopup, setFixedCategoryPopup] =
		useState<FixedCategoryPopup | null>(null);
	const [selectedMapRegion, setSelectedMapRegion] =
		useState<SelectedMapRegion | null>(null);
	const fixedCategoryPopupIdRef = useRef(0);
	const mapRegionClickHandledRef = useRef(false);
	const handleHoverRegionChange = useCallback(
		(region: MapChipFilter | null, pointerPosition?: HoverPointerPosition) => {
			setHoverRegion(region);
			setHoverPointerPosition(region == null ? null : pointerPosition ?? null);
		},
		[],
	);
	const { updateSFovViewModalOpen } = useSFovViewModal();
	const { integratedMapAreaWidth } = useMapAreaInfo();
	const setMapChipFilter = useSetMapChipFilter();
	const setCategoryDefectClass = useSetCategoryDefectClass();
	const { selectHighestAbnormalityDefect } =
		useAutoSelectHighestAbnormalityDefect();
	useEffect(() => {
		if (chipHeatMapCounts.status !== "success") return;
		onMaxChipCountReady(resultName, chipHeatMapCounts.maxChipCount);
	}, [
		chipHeatMapCounts.status,
		chipHeatMapCounts.maxChipCount,
		onMaxChipCountReady,
		resultName,
	]);
	useEffect(() => {
		if (showHeatMap && chipHeatMapCounts.status === "error") {
			onIsShowHeatMapChange(false);
		}
	}, [chipHeatMapCounts.status, onIsShowHeatMapChange, showHeatMap]);
	useEffect(() => {
		return () => setCategoryDefectClass(null);
	}, [resultName, setCategoryDefectClass]);
	const handleMapRegionClickStart = useCallback(
		(
			regionKind: MapRegionKind,
			region: MapChipFilter,
			anchorPosition?: HoverPointerPosition,
		): boolean => {
			mapRegionClickHandledRef.current = true;
			const currentRegion = fixedCategoryPopup ?? selectedMapRegion;
			if (
				currentRegion != null &&
				!isSameMapRegion(currentRegion, regionKind, region)
			) {
				setCategoryDefectClass(null);
			}
			if (
				fixedCategoryPopup != null &&
				isSameMapRegion(fixedCategoryPopup, regionKind, region)
			) {
				setFixedCategoryPopup(null);
				return false;
			}
			if (fixedCategoryPopup != null) {
				setFixedCategoryPopup(null);
				return true;
			}
			if (
				selectedMapRegion != null &&
				isSameMapRegion(selectedMapRegion, regionKind, region)
			) {
				if (anchorPosition != null) {
					fixedCategoryPopupIdRef.current += 1;
					setFixedCategoryPopup({
						id: fixedCategoryPopupIdRef.current,
						regionKind,
						region,
						anchorPosition,
					});
				}
				return false;
			}
			return true;
		},
		[fixedCategoryPopup, selectedMapRegion, setCategoryDefectClass],
	);
	const handleMapRegionSelected = useCallback(
		(regionKind: MapRegionKind, region: MapChipFilter): void => {
			setSelectedMapRegion({ regionKind, region });
		},
		[],
	);
	const handleFixedCategoryPopupClose = useCallback((popupId: number): void => {
		setFixedCategoryPopup((currentPopup) =>
			currentPopup?.id === popupId ? null : currentPopup,
		);
	}, []);
	const handleDisplayedCategoryPopupClose = useCallback((): void => {
		if (fixedCategoryPopup != null) {
			handleFixedCategoryPopupClose(fixedCategoryPopup.id);
		}
	}, [fixedCategoryPopup, handleFixedCategoryPopupClose]);
	const shouldIgnoreOutsideClick = useCallback((event: MouseEvent): boolean => {
		const wasMapRegionClick = mapRegionClickHandledRef.current;
		mapRegionClickHandledRef.current = false;
		return (
			wasMapRegionClick &&
			event.target instanceof HTMLCanvasElement
		);
	}, []);
	const handleFixedCategorySelect = useCallback(
		(defectClass: number): Promise<void> => {
			if (fixedCategoryPopup == null) return Promise.resolve();
			setCategoryDefectClass(defectClass);
			return selectHighestAbnormalityDefect(
				fixedCategoryPopup.region,
				defectClass,
			);
		},
		[
			fixedCategoryPopup,
			selectHighestAbnormalityDefect,
			setCategoryDefectClass,
		],
	);
	const displayedCategoryPopup =
		fixedCategoryPopup ??
		(hoverRegion != null && hoverPointerPosition != null
			? { region: hoverRegion, anchorPosition: hoverPointerPosition }
			: null);
	const handleMFovClick = useCallback(
		(chipIndex: Point, mfovNo: number): void => {
			setMapChipFilter({
				chipX: chipIndex.x,
				chipY: chipIndex.y,
				mFOVno: mfovNo,
			});
		},
		[setMapChipFilter],
	);

	const handleClose = (): void => {
		setIsContextMenuDisplay(false);
	};

	const handleClickTestRunOpen = (): void => {
		if (
			selectedFov != null &&
			selectedFov.mfovno !== 0 &&
			selectedFov.sfovno !== 0
		) {
			window.open(
				getTestRunURL(resultName, selectedFov.mfovno, selectedFov.sfovno),
				"Test Run",
			);
			handleClose();
		} else if (
			selectedDefect != null &&
			selectedDefect.mFOVno !== 0 &&
			selectedDefect.sFOVno !== 0
		) {
			window.open(
				getTestRunURL(resultName, selectedDefect.mFOVno, selectedDefect.sFOVno),
				"Test Run",
			);
			handleClose();
		}
	};

	const handleClickSFovViewModalOpen = (): void => {
		updateSFovViewModalOpen(true);
		handleClose();
	};

	return (
		<AppProvider value={pixiApp}>
			<Stage
				width={integratedMapAreaWidth}
				height={mapAreaHeight}
				options={{ backgroundColor: GLAY_COLOR }}
			>
				<IntegratedMapViewport
					width={integratedMapAreaWidth}
					height={mapAreaHeight}
					onChipFilterApplied={selectHighestAbnormalityDefect}
									onMapRegionClickStart={handleMapRegionClickStart}
									onMapRegionSelected={handleMapRegionSelected}
					onChipHover={handleHoverRegionChange}
				>
					<WaferMap
						heatMapCountMap={
							isHeatMapVisible ? chipHeatMapCounts.counts : null
						}
						isMaxChipCountZero={
							isHeatMapVisible && chipHeatMapCounts.maxChipCount === 0
						}
						colorMapSettings={colorMapSettings}
					/>
					<SelectedChip />
					<InspectionArea />
					<DrawMFovHex
						onMFovClick={handleMFovClick}
						onAutoSelectDefect={selectHighestAbnormalityDefect}
						onHoverRegionChange={handleHoverRegionChange}
										onMapRegionClickStart={handleMapRegionClickStart}
										onMapRegionSelected={handleMapRegionSelected}
					/>
					<SFov
						onAutoSelectDefect={selectHighestAbnormalityDefect}
						onHoverRegionChange={handleHoverRegionChange}
										onMapRegionClickStart={handleMapRegionClickStart}
										onMapRegionSelected={handleMapRegionSelected}
					/>
					{enableDefect && <DefectEmphasis />}
					{enableDefect && (
						<Defect suppressGlyphs={isHeatMapVisible} />
					)}
					<Pin />
				</IntegratedMapViewport>
			</Stage>
			{displayedCategoryPopup != null && (
				<HoverDefectClassCountsPopper
					region={displayedCategoryPopup.region}
					pointerPosition={displayedCategoryPopup.anchorPosition}
					isFixed={fixedCategoryPopup != null}
					onClose={handleDisplayedCategoryPopupClose}
								shouldIgnoreOutsideClick={shouldIgnoreOutsideClick}
					onCategorySelect={handleFixedCategorySelect}
				/>
			)}
			{MapScale()}
			<MapSlider />
			<SFovViewOpenModal />
			<Box
				data-testid="map-toggle-toolbar"
				sx={{
					position: "absolute",
					top: "8px",
					right: "1%",
					display: "flex",
					width: "max-content",
					gap: "2px",
				}}
			>
				<HeatMapToggle
					isSelected={showHeatMap && chipHeatMapCounts.status !== "error"}
					onToggle={() => onIsShowHeatMapChange(!isShowHeatMap)}
				/>
				<BorderToggle inToolbar />
				{enableDefect && <DefectToggle />}
			</Box>
			<PositionButton
				bottom={positionButtonBottom}
				right={positionButtonRight}
			/>
			<Menu
				open={isContextMenuDisplay}
				onClose={handleClose}
				anchorReference="anchorPosition"
				anchorPosition={{ top: contextMenuPoint.y, left: contextMenuPoint.x }}
				slotProps={{
					root: {
						onContextMenu: (e) => {
							e.preventDefault();
						},
					},
				}}
			>
				<MenuItem onClick={handleClickTestRunOpen}>
					<ListItemIcon>
						<FactCheckIcon />
					</ListItemIcon>
					<ListItemText>Test Run</ListItemText>
				</MenuItem>
				<MenuItem onClick={handleClickSFovViewModalOpen}>
					<ListItemIcon>
						<ImageIcon />
					</ListItemIcon>
					<ListItemText>sFOV View</ListItemText>
				</MenuItem>
			</Menu>
			<MapNotification />
		</AppProvider>
	);
};
