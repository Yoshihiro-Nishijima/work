export interface Scroll {
	x: number;
	y: number;
	smooth: boolean;
}

export interface SegmentationImageViewProps {
	showSegmentation: boolean; // Segmentationを表示するかどうか
	segmentationAlpha: number; // Segmentationの透過度
	magnification: number; // 倍率
	showScale: boolean; // スケールを表示するかどうか
	viewW: number; // 表示領域の幅 (画面px)
	viewH: number; // 表示領域の幅 (画面px)
	centerX: number; // 表示している中央座標X (SEM画像px)
	centerY: number; // 表示している中央座標X (SEM画像px)
}

export const defaultImageView: SegmentationImageViewProps = {
	showSegmentation: true,
	segmentationAlpha: 0,
	magnification: 1.0,
	showScale: false,
	centerX: 0,
	centerY: 0,
	viewW: 0,
	viewH: 0,
};
