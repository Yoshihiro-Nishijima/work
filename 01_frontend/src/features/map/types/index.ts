import type { Point } from "pixi.js";

export interface Coord {
	x: number;
	y: number;
}

export interface InspectionArea {
	no: number;
	chips: Point[];
	coordinate: number[];
	pixSize: number;
	mFOVSize: {
		x: number;
		y: number;
	};
	sFOVSize: {
		x: number;
		y: number;
	};
}

export interface Idw {
	waferSize: number;
	chipArray: {
		x: number;
		y: number;
	};
	chipPitch: {
		x: number;
		y: number;
	};
	mapOffset: {
		x: number;
		y: number;
	};
	mapOrigin: {
		x: number;
		y: number;
	};
	chipExist: string[];
	inspectionArea: InspectionArea[];
}

export interface ChipDefect {
	defectNum: number | undefined;
	indexX: number;
	indexY: number;
}

/* MFovMap管理インタフェース */
export interface MFov {
	mfovNo: number;
	areaNo: number;
	mfovX: number;
	mfovY: number;
	defectNum: number;
}

/** MFov取得 API パラメータ */
export interface GetMFovParam {
	resultName: string;
	chipIndex: Point;
}

export interface SFov {
	sfovNo: number;
	x: number; // nm
	y: number; // nm
}
