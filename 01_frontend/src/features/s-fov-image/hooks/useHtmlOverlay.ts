import { useResultJobType } from "../../misc/hooks/useResultsJobType";
import type { UseHtmlBigImage } from "../types";
import { useHtmlBigImage } from "./useHtmlBigImage";

/**
 * Defectカラー設定関数
 * @param data 8bitデータ
 * @param index インデックス
 */
export const setDefectColor = (
	data: Uint8ClampedArray,
	index: number,
): void => {
	// Defect(6bit)
	data[index] = 255; // Math.floor(0xff0000 / 0x010000)
	data[index + 1] = 0; // Math.floor((0xff0000 % 0x010000) / 0x0100)
	data[index + 2] = 0; // 0xff0000 % 0x0100
	data[index + 3] = 255;
};
/**
 * DesignReferenceカラー設定関数
 * @param data 8bitデータ
 * @param index インデックス
 */
const setDesignReferenceColor = (
	data: Uint8ClampedArray,
	index: number,
): void => {
	// Design Reference(3bit)
	data[index] = 128; // Math.floor(0x8000ff / 0x010000)
	data[index + 1] = 0; // Math.floor((0x8000ff % 0x010000) / 0x0100)
	data[index + 2] = 255; // 0x8000ff % 0x0100
	data[index + 3] = 255;
};

/**
 * DesignTargetカラー設定関数
 * @param data 8bitデータ
 * @param index インデックス
 */
const setDesignTargetColor = (data: Uint8ClampedArray, index: number): void => {
	// Design Target(1bit)
	data[index] = 0; // Math.floor(0x00ff80 / 0x010000)
	data[index + 1] = 255; // Math.floor((0x00ff80 % 0x010000) / 0x0100)
	data[index + 2] = 128; // 0x00ff80 % 0x0100
	data[index + 3] = 255;
};

/**
 * DesignLowerカラー設定関数
 * @param data 8bitデータ
 * @param index インデックス
 */
const setDesignLowerColor = (data: Uint8ClampedArray, index: number): void => {
	// Design Lower(2bit)
	data[index] = 0; // Math.floor(0x00ffff / 0x010000)
	data[index + 1] = 255; // Math.floor((0x00ffff % 0x010000) / 0x0100)
	data[index + 2] = 255; // 0x00ffff % 0x0100
	data[index + 3] = 255;
};

// ToDo:Segmentの色設定は仮設定
/**
 * Box/Segmentカラー取得関数
 * @param jobType ジョブタイプ
 */
const getBoxSegmentColor = (jobType?: string): number[] => {
	// Box/Segment色設定
	switch (jobType) {
		case "Trainable D2DB":
		case "D2D":
		case "C2C":
			// Box色設定
			return [255, 0x33, 0x99, 0xff];
		case "Trainable D2D":
			// Segment色設定
			return [255, 0x33, 0x99, 0xff];
		default:
			return [];
	}
};

/**
 * Box/Segmentカラー設定関数
 * @param data 8bitデータ
 * @param index インデックス
 */
const setBoxSegmentColor = (
	data: Uint8ClampedArray,
	index: number,
	rgb: number[],
): void => {
	// Box/Segment(7bit)
	data[index] = rgb[0];
	data[index + 1] = rgb[1];
	data[index + 2] = rgb[2];
	data[index + 3] = rgb[3];
};

// useHtmlOverlay返却値
interface UseHtmlOverlay {
	overlay: UseHtmlBigImage;
	defect: UseHtmlBigImage;
	contour: UseHtmlBigImage;
	design: UseHtmlBigImage;
	boxSegment: UseHtmlBigImage;
	Reload: () => void;
	Resize: (scale: number) => void;
}

/**
 * custom hook Overlay画像
 * @returns UseHtmlOverlay
 */
export const useHtmlOverlay = (): UseHtmlOverlay => {
	const overlay = useHtmlBigImage(null, null);
	const defect = useHtmlBigImage(null, null);
	const contour = useHtmlBigImage(null, null);
	const design = useHtmlBigImage(null, null);
	const boxSegment = useHtmlBigImage(null, null);
	const { jobType } = useResultJobType();

	// HTMLImageElement取得
	const Reload = (): void => {
		const overlayImage = overlay.GetElmImg();
		const overlayCtx = overlay.GetContext();
		if (overlayImage == null || !overlay.GetComplete() || overlayCtx == null)
			return;

		// 読み込み画像サイズを取得
		const imgWidth = overlayImage.naturalWidth;
		const imgHeight = overlayImage.naturalHeight;
		if (imgWidth <= 0 || imgHeight <= 0) return;

		// Elementサイズ更新
		overlay.SetSizeImg(imgWidth, imgHeight);
		overlay.SetSizeCanvas(imgWidth, imgHeight);

		// オーバーレイ画像のImageDataを取得する為、Canvasに描画
		overlay.GetContext()?.drawImage(overlayImage, 0, 0);
		const overlayImageData = overlayCtx.getImageData(0, 0, imgWidth, imgHeight);

		// ImageData（Defect, Contour, Design, BoxSegment）の格納先を作成
		const defectImageData = overlayCtx.createImageData(imgWidth, imgHeight);
		const contourImageData = overlayCtx.createImageData(imgWidth, imgHeight);
		const designImageData = overlayCtx.createImageData(imgWidth, imgHeight);
		const boxSegmentData = overlayCtx.createImageData(imgWidth, imgHeight);

		// Box/Segment色取得
		const gBoxSegmentRgb = getBoxSegmentColor(jobType);

		// Overlay画像解析処理
		for (let r = 0, len = overlayImageData.data.length; r < len; r += 4) {
			if ((overlayImageData.data[r] & 0b00100000) !== 0) {
				// Defect(6bit)
				setDefectColor(defectImageData.data, r);
			} else if (
				gBoxSegmentRgb.length !== 0 &&
				(overlayImageData.data[r] & 0b01000000) === 0
			) {
				// Box/Segment(7bit)
				setBoxSegmentColor(boxSegmentData.data, r, gBoxSegmentRgb);
			}

			if ((overlayImageData.data[r] & 0b00000100) !== 0) {
				// Design Reference(3bit)
				setDesignReferenceColor(designImageData.data, r);
			} else if ((overlayImageData.data[r] & 0b00000010) !== 0) {
				// Design Lower(2bit)
				setDesignLowerColor(designImageData.data, r);
			} else if ((overlayImageData.data[r] & 0b00000001) !== 0) {
				// Design Target(1bit)
				setDesignTargetColor(designImageData.data, r);
			}
		}

		// ImageDataをCanvasタグに設定後、Imgタグのsrcとして設定
		defect.SetImageData(defectImageData, "image/png");
		contour.SetImageData(contourImageData, "image/png");
		design.SetImageData(designImageData, "image/png");
		boxSegment.SetImageData(boxSegmentData, "image/png");
	};

	// Resize処理
	const Resize = (scale: number): void => {
		const overlayImage = overlay.GetElmImg();
		if (overlayImage == null) return;

		defect.SetSizeImg(
			overlayImage.naturalWidth,
			overlayImage.naturalHeight,
			scale,
		);
		contour.SetSizeImg(
			overlayImage.naturalWidth,
			overlayImage.naturalHeight,
			scale,
		);
		design.SetSizeImg(
			overlayImage.naturalWidth,
			overlayImage.naturalHeight,
			scale,
		);
		boxSegment.SetSizeImg(
			overlayImage.naturalWidth,
			overlayImage.naturalHeight,
			scale,
		);
	};

	return {
		overlay,
		defect,
		contour,
		design,
		boxSegment,
		Reload,
		Resize,
	};
};
