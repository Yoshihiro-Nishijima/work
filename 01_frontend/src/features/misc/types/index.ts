export interface Scroll {
	x: number;
	y: number;
	smooth: boolean;
}

export type ImageType = "target" | "reference1" | "reference2";

export interface ImageViewProps {
	showRoi: boolean; // ROI枠を表示するかどうか
	showDefect: boolean; // 欠陥オーバレイを表示するかどうか
	defectAlpha: number; // 欠陥オーバレイの透過度
	semAlpha: number; // SEM像の透過度
	showDesignData: boolean; // デザインデータオーバレイを表示するかどうか
	magnification: number; // 倍率
	showScale: boolean; // スケールを表示するかどうか
	showBoxSegmentData: boolean; // Box/Segmentオーバレイを表示するかどうか
	viewW: number; // 表示領域の幅 (画面px)
	viewH: number; // 表示領域の幅 (画面px)
	centerX: number; // 表示している中央座標X (SEM画像px)
	centerY: number; // 表示している中央座標X (SEM画像px)
	imageType: ImageType;
	showCrossData: boolean; // 十字マークオーバレイを表示するかどうか
}

export const defaultImageView: ImageViewProps = {
	showRoi: false,
	showDefect: false,
	defectAlpha: 0,
	semAlpha: 0,
	showDesignData: true,
	magnification: 0.2,
	showScale: false,
	showBoxSegmentData: true,
	centerX: 0,
	centerY: 0,
	viewW: 0,
	viewH: 0,
	imageType: "target",
	showCrossData: true,
};

export interface ResultsRecord {
	toolData: string;
	class: string;
	defectCount: number;
	defectDensity: number;
	waferId?: string | null;
}

export interface InfoTable {
	column: string;
	data: number | string;
}

export interface Size {
	width: number;
	height: number;
}

export interface Position {
	top: number;
	left: number;
}
