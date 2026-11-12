import type { Point } from "pixi.js";

export interface DefectRecord {
	defectId: number;
	topLeftX: number;
	topLeftY: number;
	bottomRightX: number;
	bottomRightY: number;
	abnormality: number;
	defectClass: number;
	gray: number;
	grayDiff: number;
	width: number;
	height: number;
	layers: number[];
	caughtBy: number;
	src: string;
	coordX: number;
	coordY: number;
	chipX: number;
	chipY: number;
	mFOVno: number;
	sFOVno: number;
	defectNo: number;
	area: number;
}

/** フィルター指定時の追加項目用インターフェイス */
export interface DefectWithDynamicFields extends DefectRecord {
	[key: string]: string | number | number[];
}

export type DefectFieldKey = keyof DefectRecord | string;

export interface DefectInfo {
	defectId: number;
	defectClass: number;
	mfovno: number;
	sfovno: number;
	coordX: number;
	coordY: number;
}

export interface ChipDefectInfo {
	chipIndex: Point;
	defects: DefectInfo[];
}

/** 範囲指定による欠陥点取得APIレスポンス */
export interface RangedDefectInfo {
	indexX: number;
	indexY: number;
	defects: DefectInfo[];
}

/** 範囲指定による欠陥点取得APIリクエストパラメータ */
export interface RangedDefectsInfoGetParam {
	resultName: string;
	chipX: number;
	chipY: number;
	minCoordX: number;
	maxCoordX: number;
	minCoordY: number;
	maxCoordY: number;
	rank?: number;
	filterQuery?: string;
}

export interface FixedImgDataType {
	id: number;
	img: string;
	chipX: number;
	chipY: number;
	coordX: number;
	coordY: number;
	abnormality: number;
	mFOVNo: number;
	sFOVNo: number;
	No: number;
	selectmode: number;
	imgborder: number;
	imgbordercolor: string;
}

export interface FixedDataType {
	columnIndex: number;
	rowIndex: number;
	style: object;
	data: FixedImgDataType[][];
}
