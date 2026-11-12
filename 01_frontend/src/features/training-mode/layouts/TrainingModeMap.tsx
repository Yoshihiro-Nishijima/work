import ImageIcon from "@mui/icons-material/Image";
import Remove from "@mui/icons-material/Remove";
import { ListItemIcon, ListItemText, Menu, MenuItem } from "@mui/material";
import { AppProvider, Stage } from "@pixi/react";
import { Allotment } from "allotment";
import * as PIXI from "pixi.js";
import { useRef } from "react";

import { MAGNIFICATION_SLIDER_HEIGHT } from "~/components/elements/MagnificationSlider";
import { BorderToggle } from "~/features/integrated-viewer-map/components/BorderToggle";
import { DrawMFovHex } from "~/features/integrated-viewer-map/components/DrawMFovHex";
import { InspectionArea } from "~/features/integrated-viewer-map/components/InspectionArea";
import { IntegratedMapViewport } from "~/features/integrated-viewer-map/components/IntegratedMapViewport";
import { MapScale } from "~/features/integrated-viewer-map/components/MapScale";
import {
	MapSlider,
	SCALE_SLIDER_BOTTOM_HEIGHT,
	SCALE_SLIDER_RIGHT_WIDTH,
} from "~/features/integrated-viewer-map/components/MapSlider";
import { PositionButton } from "~/features/integrated-viewer-map/components/PositionButton";
import { SelectedChip } from "~/features/integrated-viewer-map/components/SelectedChip";
import { WaferMap } from "~/features/integrated-viewer-map/components/WaferMap";
import { useContextMenuDisplay } from "~/features/integrated-viewer-map/hooks/useContextMenuDisplay";
import { useMapAreaInfo } from "~/features/integrated-viewer-map/hooks/useMapAreaInfo";
import {
	MAP_MAX_SCALE,
	TRAINING_MODE_MAP_MIN_SCALE,
} from "~/features/integrated-viewer-map/hooks/useMapInfo";
import { TRAINING_MODE_MAP_MIN_OPERATION_SCALE } from "~/features/integrated-viewer-map/hooks/useMapSliderInfo";
import { useSFovThumbnailDrawInfo } from "~/features/integrated-viewer-map/hooks/useSFovThumbnailDrawInfo";
import { useSFovViewModal } from "~/features/integrated-viewer-sfov-view/hooks/useSFovViewModal";
import { useSelectedSFovImageIdList } from "~/features/misc/hooks/useSelectedSFovImageIdList";

import { RectSelection } from "../components/RectSelection";
import { TrainingModeMenu } from "../components/TrainingModeMenu";
import { TrainingModeSFov } from "../components/TrainingModeSFov";
import { useAdjacentSFovThumbnailDrawInfoList } from "../hooks/useAdjacentSFovThumbnailDrawInfoList";
import { useMapContextMenuSFov } from "../hooks/useMapContextMenuSFov";
import { useRectSelecting } from "../hooks/useRectSelecting";

const pixiApp = new PIXI.Application({});

/** glay色カラーコード */
const GLAY_COLOR = 0x808080;
/** Trainingメニューエリア幅(BulkImport,sFovリスト,Training実行ボタン等) */
const MENU_WIDTH = 300;

/** MapSlider基準のPositionボタンのBottom位置(MapSliderの下端+MapSliderの高さ+MapSliderから何px離した位置に配置するか) */
const POSITION_BUTTON_BOTTOM = `${SCALE_SLIDER_BOTTOM_HEIGHT + MAGNIFICATION_SLIDER_HEIGHT + 10}px`;
const POSITION_BUTTON_RIGHT = `${SCALE_SLIDER_RIGHT_WIDTH}px`;

export const TrainingModeMap = (): JSX.Element => {
	const { isContextMenuDisplay, contextMenuPoint, setIsContextMenuDisplay } =
		useContextMenuDisplay();
	const { updateSFovViewModalOpen } = useSFovViewModal();
	const { integratedMapAreaHeight, integratedMapAreaWidth } = useMapAreaInfo();
	const { mapContextMenuSFov } = useMapContextMenuSFov();
	const { selectedMFovImageListForTraining } = useSFovThumbnailDrawInfo();
	const { remove } = useSelectedSFovImageIdList();
	const { getAdjacentSFovThumbnailDrawInfoList } =
		useAdjacentSFovThumbnailDrawInfoList();
	const ref = useRef<HTMLDivElement>();
	const isSelected = selectedMFovImageListForTraining.some(
		(i) => i.imageid === mapContextMenuSFov?.imageid,
	);

	const {
		onMouseMoveCapture,
		onMouseUpCapture,
		rectSelectingPointStart,
		rectSelectingPointEnd,
	} = useRectSelecting();

	const handleClose = (): void => {
		setIsContextMenuDisplay(false);
	};

	const handleRemove = (): void => {
		if (mapContextMenuSFov == null) return;
		const adjacentMFovImageIdList = getAdjacentSFovThumbnailDrawInfoList(
			mapContextMenuSFov,
			selectedMFovImageListForTraining,
		).map((e) => e.imageid);
		remove(adjacentMFovImageIdList);
		handleClose();
	};

	const handleClickSFovViewModalOpen = (): void => {
		updateSFovViewModalOpen(true);
		handleClose();
	};

	const handleMouseMoveCapture = (
		e: React.MouseEvent<HTMLCanvasElement>,
	): void => {
		const mouseEvent = e.nativeEvent;
		onMouseMoveCapture(mouseEvent, ref.current?.clientWidth ?? 0);
	};

	const handleMouseUpCapture = (
		e: React.MouseEvent<HTMLCanvasElement>,
	): void => {
		const mouseEvent = e.nativeEvent;
		onMouseUpCapture(mouseEvent);
	};

	return (
		<Allotment
			minSize={100}
			defaultSizes={[MENU_WIDTH, integratedMapAreaWidth - MENU_WIDTH]}
		>
			<Allotment.Pane preferredSize={MENU_WIDTH} ref={ref}>
				<TrainingModeMenu />
			</Allotment.Pane>
			<Allotment.Pane>
				<AppProvider value={pixiApp}>
					<Stage
						width={integratedMapAreaWidth}
						height={integratedMapAreaHeight}
						options={{ backgroundColor: GLAY_COLOR }}
						onMouseMoveCapture={handleMouseMoveCapture}
						onMouseUpCapture={handleMouseUpCapture}
					>
						<IntegratedMapViewport
							width={integratedMapAreaWidth}
							height={integratedMapAreaHeight}
							minScale={TRAINING_MODE_MAP_MIN_SCALE}
							maxScale={MAP_MAX_SCALE}
						>
							<WaferMap />
							<SelectedChip />
							<InspectionArea />
							<DrawMFovHex highlightSelectedMFov />
							<TrainingModeSFov />
							{rectSelectingPointStart != null &&
								rectSelectingPointEnd != null && (
									<RectSelection
										start={rectSelectingPointStart}
										end={rectSelectingPointEnd}
									/>
								)}
						</IntegratedMapViewport>
					</Stage>
					{MapScale()}
					<MapSlider minScale={TRAINING_MODE_MAP_MIN_OPERATION_SCALE} />
					<BorderToggle />
					<PositionButton
						bottom={POSITION_BUTTON_BOTTOM}
						right={POSITION_BUTTON_RIGHT}
						disabled
					/>
					<Menu
						open={isContextMenuDisplay}
						onClose={handleClose}
						anchorReference="anchorPosition"
						anchorPosition={{
							top: contextMenuPoint.y,
							left: contextMenuPoint.x + (ref.current?.clientWidth ?? 0),
						}}
						slotProps={{
							root: {
								onContextMenu: (e) => {
									e.preventDefault();
								},
							},
						}}
					>
						<MenuItem onClick={handleRemove} disabled={!isSelected}>
							<ListItemIcon>
								<Remove />
							</ListItemIcon>
							<ListItemText>Remove</ListItemText>
						</MenuItem>
						<MenuItem onClick={handleClickSFovViewModalOpen}>
							<ListItemIcon>
								<ImageIcon />
							</ListItemIcon>
							<ListItemText>sFOV View</ListItemText>
						</MenuItem>
					</Menu>
				</AppProvider>
			</Allotment.Pane>
		</Allotment>
	);
};
