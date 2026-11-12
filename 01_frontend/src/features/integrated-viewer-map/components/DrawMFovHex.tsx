import { PixiComponent } from "@pixi/react";
import {
	type DisplayObject as PixiDisplayObject,
	Graphics as PixiGraphics,
	Point,
	Polygon as PixiPolygon,
} from "pixi.js";
import { useMemo } from "react";

import type { MapChipFilter } from "~/features/defect-list/hooks/useDefect";
import { useIdw } from "~/features/map/hooks";
import { useFovList } from "~/features/s-fov-list/hooks/useFovList";
import type { Fov } from "~/features/s-fov-list/types";

import { useChipMapInfo } from "../hooks/useChipMapInfo";
import {
	isMFovHexDisplayLevel,
	isSFovThumbnailDisplayLevel,
	useMFovMapInfo,
} from "../hooks/useMapInfo";
import { useMapMFovs } from "../hooks/useMapMFovs";
import type {
	ChipMFov,
	HoverPointerPosition,
	HoverRegionChange,
	MapRegionKind,
} from "../types";

interface DrawMFovHexProps {
	// 選択中のMFovを強調表示するならばTrue
	highlightSelectedMFov?: boolean;
	onMFovClick?: (chipIndex: Point, mfovNo: number) => void;
	onAutoSelectDefect?: (region: MapChipFilter) => void;
	onHoverRegionChange?: HoverRegionChange;
	onMapRegionClickStart?: (
		regionKind: MapRegionKind,
		region: MapChipFilter,
		pointerPosition?: HoverPointerPosition,
	) => boolean;
	onMapRegionSelected?: (
		regionKind: MapRegionKind,
		region: MapChipFilter,
	) => void;
}

export const MFOV_HEX_GRAPHICS_NAME = "mFovHexes";

/**
 * MFov6角形描画用パラメータ
 */
export interface MFovHexGeometryProps {
	// 1chipの pixel数
	pixelSizeX: number;
	pixelSizeY: number;
	// mFOVのPixelサイズ取得処理
	getMFovPixSize: (no: number, point: Point) => Point;
	// 描画上のChip座標変換関数
	toDrawChipIndex: (idwChipIndex: Point) => Point;
	// IDW座標を使用した描画座標取得関数
	toDrawChipPoint: (
		pixelSizeX: number,
		pixelSizeY: number,
		fovPoint: Point,
	) => Point;
}

interface PixiComponentDrawMFovHexInfo extends MFovHexGeometryProps {
	// MFov管理情報
	chipMfovList: ChipMFov[];
	// mFOV Hex境界線の太さ
	mFovHexLineThickness: number;
	// 選択中のFov(Training Mode)
	selectedFovListForTraining: Fov[];
	// 選択中のMFovを強調表示するならばTrue
	highlightSelectedMFov: boolean;
	// sFovサムネイル表示要否
	disabledSFovThumbnail: boolean;
	onMFovClick?: (chipIndex: Point, mfovNo: number) => void;
	onAutoSelectDefect?: (region: MapChipFilter) => void;
	onHoverRegionChange?: HoverRegionChange;
	onMapRegionClickStart?: (
		regionKind: MapRegionKind,
		region: MapChipFilter,
		pointerPosition?: HoverPointerPosition,
	) => boolean;
	onMapRegionSelected?: (
		regionKind: MapRegionKind,
		region: MapChipFilter,
	) => void;
}

export interface MFovHexHitTarget {
	chipIndex: Point;
	mfovNo: number;
	polygon: PixiPolygon;
}

export const createMFovHexHitTargets = (
	props: MFovHexGeometryProps,
	chipMfovList: ChipMFov[],
): Map<ChipMFov, MFovHexHitTarget[]> => {
	return new Map(
		chipMfovList.map((chipMfov) => {
			const drawChipIndex = props.toDrawChipIndex(chipMfov.chipIndex);
			const chipOriginPoint = new Point(
				drawChipIndex.x * props.pixelSizeX,
				drawChipIndex.y * props.pixelSizeY,
			);
			const targets = chipMfov.mFovList.map((element) => {
				const mfovDrawChipPoint = props.toDrawChipPoint(
					props.pixelSizeX,
					props.pixelSizeY,
					new Point(element.mfovX, element.mfovY),
				);
				const pixelCoordinate = {
					x: chipOriginPoint.x + mfovDrawChipPoint.x,
					y: chipOriginPoint.y + props.pixelSizeY - mfovDrawChipPoint.y,
				};
				const pixelSize = props.getMFovPixSize(
					element.areaNo,
					new Point(props.pixelSizeX, props.pixelSizeY),
				);
				const xStart = pixelCoordinate.x - pixelSize.x / 2;
				const yStart = pixelCoordinate.y - pixelSize.y / 2;
				const polygon = new PixiPolygon([
					xStart + pixelSize.x * (1 / 4),
					yStart,
					xStart + pixelSize.x * (3 / 4),
					yStart,
					xStart + pixelSize.x,
					yStart + pixelSize.y / 2,
					xStart + pixelSize.x * (3 / 4),
					yStart + pixelSize.y,
					xStart + pixelSize.x * (1 / 4),
					yStart + pixelSize.y,
					xStart,
					yStart + pixelSize.y / 2,
				]);
				return {
					chipIndex: chipMfov.chipIndex,
					mfovNo: element.mfovNo,
					polygon,
				};
			});
			return [chipMfov, targets];
		}),
	);
};

export const findMFovHexHitTarget = (
	hitTargets: MFovHexHitTarget[],
	x: number,
	y: number,
): MFovHexHitTarget | undefined => {
	for (let i = hitTargets.length - 1; i >= 0; i--) {
		const target = hitTargets[i];
		if (target.polygon.contains(x, y)) return target;
	}
	return undefined;
};

export const configureMFovHexInteraction = (
	graphics: PixiGraphics,
	hitTargets: MFovHexHitTarget[],
	onMFovClick?: (chipIndex: Point, mfovNo: number) => void,
	onAutoSelectDefect?: (region: MapChipFilter) => void,
	onHoverRegionChange?: HoverRegionChange,
	onMapRegionClickStart?: (
		regionKind: MapRegionKind,
		region: MapChipFilter,
		pointerPosition?: HoverPointerPosition,
	) => boolean,
	onMapRegionSelected?: (
		regionKind: MapRegionKind,
		region: MapChipFilter,
	) => void,
): void => {
	graphics.removeAllListeners("pointerdown");
	graphics.removeAllListeners("pointertap");
	graphics.removeAllListeners("pointerupoutside");
	graphics.removeAllListeners("pointermove");
	graphics.removeAllListeners("pointerout");
	if (
		onMFovClick == null &&
		onAutoSelectDefect == null &&
		onHoverRegionChange == null &&
		onMapRegionClickStart == null &&
		onMapRegionSelected == null
	) {
		graphics.interactive = false;
		graphics.hitArea = undefined;
		graphics.name = "";
		return;
	}

	graphics.interactive = true;
	graphics.name = MFOV_HEX_GRAPHICS_NAME;
	graphics.hitArea = {
		contains: (x: number, y: number): boolean =>
			findMFovHexHitTarget(hitTargets, x, y) != null,
	};
	let pointerDownPoint: Point | undefined;
	graphics.on("pointerdown", (event) => {
		pointerDownPoint = event.global.clone();
	});
	graphics.on("pointerupoutside", () => {
		pointerDownPoint = undefined;
	});
	graphics.on("pointertap", (event) => {
		const downPoint = pointerDownPoint;
		pointerDownPoint = undefined;
		if (
			downPoint == null ||
			Math.hypot(
				event.global.x - downPoint.x,
				event.global.y - downPoint.y,
			) > 5
		) {
			return;
		}
		const point = event.getLocalPosition(graphics);
		const target = findMFovHexHitTarget(hitTargets, point.x, point.y);
		if (target != null) {
			if (event.button === 0) {
				const region = {
					chipX: target.chipIndex.x,
					chipY: target.chipIndex.y,
					mFOVno: target.mfovNo,
				};
				const nativeEvent = event.nativeEvent as PointerEvent | undefined;
				if (
					onMapRegionClickStart?.(
						"mFOV",
						region,
						nativeEvent == null
							? undefined
							: { x: nativeEvent.clientX, y: nativeEvent.clientY },
					) === false
				) {
					return;
				}
				onMFovClick?.(target.chipIndex, target.mfovNo);
				onAutoSelectDefect?.(region);
				onMapRegionSelected?.("mFOV", region);
			} else {
				onMFovClick?.(target.chipIndex, target.mfovNo);
			}
		}
	});
	if (onHoverRegionChange != null) {
		graphics.on("pointermove", (event) => {
			const point = event.getLocalPosition(graphics);
			const target = findMFovHexHitTarget(hitTargets, point.x, point.y);
			const nativeEvent = event.nativeEvent as PointerEvent;
			onHoverRegionChange(
				target == null
					? null
					: {
							chipX: target.chipIndex.x,
							chipY: target.chipIndex.y,
							mFOVno: target.mfovNo,
						},
				{ x: nativeEvent.clientX, y: nativeEvent.clientY },
			);
		});
		graphics.on("pointerout", () => onHoverRegionChange(null));
	}
};

const DrawMFovHexComponent = PixiComponent<
	PixiComponentDrawMFovHexInfo,
	PixiDisplayObject
>("DrawMFovHexComponent", {
	create: () => {
		return new PixiGraphics() as PixiDisplayObject;
	},
	applyProps: (o, _oldProps, _newProps) => {
		const g = o as PixiGraphics;
		g.clear();

		if (_newProps.chipMfovList.length === 0) {
			configureMFovHexInteraction(
				g,
				[],
				_newProps.onMFovClick,
				_newProps.onAutoSelectDefect,
				_newProps.onHoverRegionChange,
				_newProps.onMapRegionClickStart,
				_newProps.onMapRegionSelected,
			);
			return g as PixiDisplayObject;
		}
		const hitTargetsByChip = createMFovHexHitTargets(
			_newProps,
			_newProps.chipMfovList,
		);
		const hitTargets = Array.from(hitTargetsByChip.values()).flat();

		for (let i = 0; i < _newProps.chipMfovList.length; i++) {
			const mapMFov: ChipMFov = _newProps.chipMfovList[i];
			const chipHitTargets = hitTargetsByChip.get(mapMFov) ?? [];
			const drawChipHex = (target: MFovHexHitTarget): void => {
				g.drawPolygon(target.polygon.points);
			};

			// Training Mode かつ 表示倍率が ChipMap レベルの場合
			if (_newProps.highlightSelectedMFov && _newProps.disabledSFovThumbnail) {
				// 非選択中mfovのHEX描画
				g.lineStyle(_newProps.mFovHexLineThickness, "black");
				for (const target of chipHitTargets) {
					if (
						_newProps.selectedFovListForTraining.length === 0 ||
						_newProps.selectedFovListForTraining.some((fov) => {
							return (
								mapMFov.chipIndex.x !== fov.indexX ||
								mapMFov.chipIndex.y !== fov.indexY ||
								target.mfovNo !== fov.mfovno
							);
						})
					) {
						drawChipHex(target);
					}
				}
				// 選択中mfovのHEX描画 (選択中を上に表示するため後から描画する)
				g.lineStyle(_newProps.mFovHexLineThickness, "red");
				for (const target of chipHitTargets) {
					if (
						_newProps.selectedFovListForTraining.some((fov) => {
							return (
								mapMFov.chipIndex.x === fov.indexX &&
								mapMFov.chipIndex.y === fov.indexY &&
								target.mfovNo === fov.mfovno
							);
						})
					) {
						g.beginFill("orange");
						drawChipHex(target);
						g.endFill();
					}
				}
			} else {
				// HEX描画
				g.lineStyle(_newProps.mFovHexLineThickness, "darkgray");
				for (const target of chipHitTargets) {
					drawChipHex(target);
				}
			}
		}

		configureMFovHexInteraction(
			g,
			hitTargets,
			_newProps.onMFovClick,
			_newProps.onAutoSelectDefect,
			_newProps.onHoverRegionChange,
			_newProps.onMapRegionClickStart,
			_newProps.onMapRegionSelected,
		);
		return g as PixiDisplayObject;
	},
});

export const DrawMFovHex = (props: DrawMFovHexProps): JSX.Element => {
	const { chipMapInfo } = useChipMapInfo();
	const { idw, getMFovPixSize, toDrawChipIndex, toDrawChipPoint } = useIdw();
	const { mapMFovs } = useMapMFovs();
	const { mFovHexLineThickness } = useMFovMapInfo();
	const { selectedFovListForTraining } = useFovList();
	const enabledMFovHex = idw != null && isMFovHexDisplayLevel();
	const disabledSFovThumbnail = !isSFovThumbnailDisplayLevel();

	return useMemo(
		() =>
			enabledMFovHex ? (
				<DrawMFovHexComponent
					chipMfovList={mapMFovs}
					pixelSizeX={chipMapInfo.pixelSizeX}
					pixelSizeY={chipMapInfo.pixelSizeY}
					toDrawChipIndex={toDrawChipIndex}
					toDrawChipPoint={toDrawChipPoint}
					getMFovPixSize={getMFovPixSize}
					mFovHexLineThickness={mFovHexLineThickness}
					selectedFovListForTraining={selectedFovListForTraining}
					highlightSelectedMFov={props.highlightSelectedMFov ?? false}
					disabledSFovThumbnail={disabledSFovThumbnail}
					onMFovClick={props.onMFovClick}
					onAutoSelectDefect={props.onAutoSelectDefect}
					onHoverRegionChange={props.onHoverRegionChange}
					onMapRegionClickStart={props.onMapRegionClickStart}
					onMapRegionSelected={props.onMapRegionSelected}
				/>
			) : (
				<></>
			),
		[
			mapMFovs,
			chipMapInfo.pixelSizeX,
			chipMapInfo.pixelSizeY,
			toDrawChipIndex,
			toDrawChipPoint,
			getMFovPixSize,
			mFovHexLineThickness,
			selectedFovListForTraining,
			props.highlightSelectedMFov,
			props.onMFovClick,
			props.onAutoSelectDefect,
			props.onHoverRegionChange,
			props.onMapRegionClickStart,
			props.onMapRegionSelected,
			disabledSFovThumbnail,
			enabledMFovHex,
		],
	);
};
