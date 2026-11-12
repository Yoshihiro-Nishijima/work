import { PixiComponent, useApp } from "@pixi/react";
import { Viewport } from "pixi-viewport";
import { type Application as PIXIApplication, Point } from "pixi.js";
import type React from "react";
import { useCallback, useEffect, useLayoutEffect, useRef } from "react";
import type { Dispatch, SetStateAction } from "react";
import { IS_CHIP_EXIST } from "~/config";
import type { MapChipFilter } from "~/features/defect-list/hooks/useDefect";
import { useChipMapInfo } from "~/features/integrated-viewer-map/hooks/useChipMapInfo";
import { useIdw } from "~/features/map/hooks";
import { useMapClickedStatus } from "~/features/misc/hooks/useMapClickedStatus";
import { useMapSelectionStatus } from "~/features/misc/hooks/useMapSelectionStatus";
import { useRectSelecting } from "~/features/training-mode/hooks/useRectSelecting";
import { useViewport } from "~/features/training-mode/hooks/useViewport";
import {
	MAP_DEFAULT_SCALE,
	MAP_MAX_SCALE,
	MAP_MIN_SCALE,
	useMapDisplay,
	useMapInfo,
} from "../hooks/useMapInfo";
import { DEFECT_GRAPHICS_NAME } from "./Defect";
import { MFOV_HEX_GRAPHICS_NAME } from "./DrawMFovHex";
import { SFOV_THUMBNAIL_SPRITE_NAME } from "./SFovThumbnail";
import type {
	DisplayPoint,
	HoverPointerPosition,
	HoverRegionChange,
	MapRegionKind,
} from "../types";

const WHEEL_PERCENT = 0.000000001;
const SMOOTH = 10;

/** ホイール拡大1回あたり、選択欠陥へ近づける割合 */
const DEFECT_CENTER_APPROACH_RATIO = 0.25;
 
/** 選択欠陥へ到達したと見なすワールド座標上の距離 */
const DEFECT_CENTER_DISTANCE_THRESHOLD = 0.01;

const toDisplayPoint = (viewport: Viewport): DisplayPoint => {
	return {
		canvasMinX: viewport.left,
		canvasMaxX: viewport.right,
		canvasMinY: viewport.top,
		canvasMaxY: viewport.bottom,
	};
};

interface ViewportProps {
	width: number;
	height: number;
	minScale?: number;
	maxScale?: number;
	children?: React.ReactNode;
	onChipFilterApplied?: (region: MapChipFilter) => void;
	onMapRegionClickStart?: (
		regionKind: MapRegionKind,
		region: MapChipFilter,
		pointerPosition?: HoverPointerPosition,
	) => boolean;
	onMapRegionSelected?: (
		regionKind: MapRegionKind,
		region: MapChipFilter,
	) => void;
	onChipHover?: HoverRegionChange;
}

interface PixiComponentViewportProps extends ViewportProps {
	app: PIXIApplication;
	setScale: Dispatch<SetStateAction<number>>;
	setClickedPoint: (
		point: Point,
		button?: number,
		targetName?: string,
		clientPosition?: HoverPointerPosition,
	) => void;
	setWorldPointOfCenterChip: Dispatch<SetStateAction<Point>>;
	setMapDisplayPoint: (displayPoint: DisplayPoint) => void;
	setViewport: Dispatch<SetStateAction<Viewport | undefined>>;
	getChipRegionAt: (worldPoint: Point) => MapChipFilter | null;
}

const PixiComponentViewport = PixiComponent<
	PixiComponentViewportProps,
	Viewport
>("Viewport", {
	create: (props: PixiComponentViewportProps) => {
		const viewport = new Viewport({
			screenWidth: props.width,
			screenHeight: props.height,
			worldWidth: props.width,
			worldHeight: props.height,
			ticker: props.app.ticker,
			events: props.app.renderer.events,
			disableOnContextMenu: true,
		});
		viewport
			.drag()
			.pinch()
			.wheel({ percent: WHEEL_PERCENT, smooth: SMOOTH })
			.clampZoom({
				minScale: props.minScale ?? MAP_MIN_SCALE,
				maxScale: props.maxScale ?? MAP_MAX_SCALE,
			})
			.setZoom(MAP_DEFAULT_SCALE)
			.moveCenter(props.width, props.height)
			.on("zoomed-end", () => {
				props.setScale(viewport.scale.x);
				props.setWorldPointOfCenterChip(viewport.center);
				// 表示範囲設定
				props.setMapDisplayPoint(toDisplayPoint(viewport));
			})
			// スクロールのイベントはこれ。ただし拡大時も呼ばれる。
			.on("moved-end", () => {
				props.setWorldPointOfCenterChip(viewport.center);
				// 表示範囲設定
				props.setMapDisplayPoint(toDisplayPoint(viewport));
			})
			.on("clicked", (e) => {
				const targetName = e.event.target?.name;
				if (
					targetName === MFOV_HEX_GRAPHICS_NAME ||
					targetName === DEFECT_GRAPHICS_NAME ||
					targetName === SFOV_THUMBNAIL_SPRITE_NAME
				) {
					return;
				}
				const nativeEvent = e.event.nativeEvent as PointerEvent | undefined;
				props.setClickedPoint(
					e.world,
					e.event.button,
					targetName,
					nativeEvent == null
						? undefined
						: { x: nativeEvent.clientX, y: nativeEvent.clientY },
				);
			})
			.on("pointermove", (event) => {
				if (props.onChipHover == null) return;
				const targetName = (event.target as { name?: string } | null)?.name;
				if (
					targetName === MFOV_HEX_GRAPHICS_NAME ||
					targetName === SFOV_THUMBNAIL_SPRITE_NAME
				) {
					return;
				}
				if (targetName === DEFECT_GRAPHICS_NAME) {
					props.onChipHover(null);
					return;
				}
				const nativeEvent = event.nativeEvent as PointerEvent;
				props.onChipHover(
					props.getChipRegionAt(viewport.toWorld(event.global)),
					{ x: nativeEvent.clientX, y: nativeEvent.clientY },
				);
			})
			.once("frame-end", () => {
				// viewportの初回描画完了時に動作する
				props.setScale(viewport.scale.x);
				props.setWorldPointOfCenterChip(viewport.center);
				// 表示範囲設定
				props.setMapDisplayPoint(toDisplayPoint(viewport));
			});
		props.setViewport(viewport);
		return viewport;
	},
	applyProps: (viewport, _oldProps, newProps) => {
		viewport.resize(newProps.width, newProps.height);
	},
});

export const IntegratedMapViewport = (props: ViewportProps): JSX.Element => {
	const app = useApp();
	const { idw, calcDrawChipIndex, toIdwChipIndex } = useIdw();
	const { chipMapInfo } = useChipMapInfo();
	const { scale, setScale, setMapDisplayPoint } = useMapInfo();
	const { displayCenterPoint, moveSelectedObjPoint, setDisplayCenterPoint } =
		useMapDisplay();

	const { setClickedPoint } = useMapClickedStatus();

	const viewportRef = useRef<Viewport>(null);
	const {
		isFirstSelect,
		selectedSfovPixelPoint,
		selectedDefectPixelPoint,
	} = useMapSelectionStatus({
		isChipClickHandler: true,
		onChipFilterApplied: props.onChipFilterApplied,
		onMapRegionClickStart: props.onMapRegionClickStart,
		onMapRegionSelected: props.onMapRegionSelected,
	});

	const isInitSelectRef = useRef(false);

	const { isRectSelecting } = useRectSelecting();
	const { setViewport } = useViewport();
	const getChipRegionAt = useCallback(
		(worldPoint: Point): MapChipFilter | null => {
			if (
				idw == null ||
				chipMapInfo.pixelSizeX <= 0 ||
				chipMapInfo.pixelSizeY <= 0
			) {
				return null;
			}
			const drawChipIndex = calcDrawChipIndex(
				worldPoint,
				chipMapInfo.pixelSizeX,
				chipMapInfo.pixelSizeY,
			);
			if (
				chipMapInfo.chipExist[drawChipIndex.y]?.[drawChipIndex.x] !==
				IS_CHIP_EXIST
			) {
				return null;
			}
			const chipIndex = toIdwChipIndex(drawChipIndex);
			return { chipX: chipIndex.x, chipY: chipIndex.y };
		},
		[
			calcDrawChipIndex,
			chipMapInfo,
			idw,
			toIdwChipIndex,
		],
	);
	useEffect(() => {
		if (props.onChipHover == null) return;
		const domElement = app.renderer.events.domElement;
		const handlePointerLeave = (): void => props.onChipHover?.(null);
		domElement.addEventListener("pointerleave", handlePointerLeave);
		return () => {
			domElement.removeEventListener("pointerleave", handlePointerLeave);
		};
	}, [app, props.onChipHover]);

	// ホイール拡大前に、今回のズーム中心を設定する
	useEffect(() => {
		const viewport = viewportRef.current;
		const domElement = app.renderer.events.domElement;
		if (viewport == null) {
			return;
		}
		const handleWheelCapture = (event: WheelEvent): void => {
			const wheelPlugin = viewport.plugins.get("wheel");
			if (wheelPlugin == null) {
				return;
			}

			// 欠陥未選択時は従来どおりマウスポインター中心
			if (selectedDefectPixelPoint == null) {
				wheelPlugin.options.center = null;
				return;
			}

			// 縮小時は従来どおりマウスポインター中心
			if (event.deltaY >= 0) {
				wheelPlugin.options.center = null;
				return;
			}

			const currentCenter = viewport.center;
			const diffX = selectedDefectPixelPoint.x - currentCenter.x;
			const diffY = selectedDefectPixelPoint.y - currentCenter.y;
			const distance = Math.hypot(diffX, diffY);

			// 十分近い場合は選択欠陥を正確なズーム中心にする
			if (distance <= DEFECT_CENTER_DISTANCE_THRESHOLD) {
				wheelPlugin.options.center = selectedDefectPixelPoint;
				return;
			}

			// 現在中心から選択欠陥へ一定割合だけ近づけた座標
			const nextCenter = new Point(
				currentCenter.x + diffX * DEFECT_CENTER_APPROACH_RATIO,
				currentCenter.y + diffY * DEFECT_CENTER_APPROACH_RATIO,
			);

			wheelPlugin.options.center = nextCenter;
		};

		domElement.addEventListener(
			"wheel",
			handleWheelCapture,
			{
				capture: true,
			},
		);

		return () => {
			domElement.removeEventListener(
				"wheel",
				handleWheelCapture,
				{
					capture: true,
				},
			);
		};
	}, [app, selectedDefectPixelPoint]);

	// trainingModeの矩形選択中はviewportの更新を止める
	useEffect(() => {
		if (viewportRef.current == null) return;
		viewportRef.current.pause = isRectSelecting;
	}, [isRectSelecting]);

	// 初回選択中SFov設定時のみ、表示位置を選択中SFovにする
	// biome-ignore lint/correctness/useExhaustiveDependencies: 初期sFOV選択時のみ処理したいのでisFirstSelectのみ監視
	useLayoutEffect(() => {
		if (
			selectedSfovPixelPoint == null ||
			viewportRef.current == null ||
			!isFirstSelect ||
			isInitSelectRef.current
		) {
			return;
		}
		moveSelectedObjPoint();
		isInitSelectRef.current = true;
	}, [isFirstSelect]);

	// Positionボタンクリック時の描画位置移動
	useLayoutEffect(() => {
		if (
			viewportRef.current == null ||
			displayCenterPoint.x === 0 ||
			displayCenterPoint.y === 0
		) {
			return;
		}
		viewportRef.current.moveCenter(displayCenterPoint.x, displayCenterPoint.y);
	}, [displayCenterPoint]);

	useLayoutEffect(() => {
		if (viewportRef.current == null) return;
		viewportRef.current.setZoom(scale, true);
	}, [scale]);

	return (
		<PixiComponentViewport
			app={app}
			setScale={setScale}
			setWorldPointOfCenterChip={setDisplayCenterPoint}
			setMapDisplayPoint={setMapDisplayPoint}
			setClickedPoint={setClickedPoint}
			ref={viewportRef}
			setViewport={setViewport}
			getChipRegionAt={getChipRegionAt}
			{...props}
		/>
	);
};
