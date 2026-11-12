import type { Point } from "pixi.js";

import type { MapChipFilter } from "~/features/defect-list/hooks/useDefect";
import type { MFov } from "~/features/map/types";

export interface HoverPointerPosition {
	x: number;
	y: number;
}

export type MapRegionKind = "chip" | "mFOV" | "sFOV";

export type HoverRegionChange = (
	region: MapChipFilter | null,
	pointerPosition?: HoverPointerPosition,
) => void;
/** 拡大率に合わせたDefect表示レベル */
export type DefectDisplayLevel =
	| "WaferMap"
	| "ChipMapLv1"
	| "ChipMapLv2"
	| "MFovMap";

/** 表示範囲(Map画面の図形描画エリア短形座標) */
export interface DisplayViewArea {
	leftTopPoint: Point;
	rightBottomPoint: Point;
}

/** 1Chip毎のMFov情報(Map表示用 ) */
export interface ChipMFov {
	chipIndex: Point;
	mFovList: MFov[];
}

/** 表示中ViewPort座標情報 */
export interface DisplayPoint {
	canvasMinX: number;
	canvasMaxX: number;
	canvasMinY: number;
	canvasMaxY: number;
}

/** InspectionArea描画用情報 */
export interface InspectionAreaDrawParam {
	areaNo: number;
	drawChipIndex: Point;
	idwCoordinateMinX: number;
	idwCoordinateMaxX: number;
	idwCoordinateMinY: number;
	idwCoordinateMaxY: number;
}

/** Map表示用欠陥点座標 */
export interface DefectPoint {
	defectId: number;
	defectClass: number;
	x: number;
	y: number;
}
