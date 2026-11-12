import type { DefectRecord } from "~/features/defect-list/types";

import type { UseHtmlBigImage } from "../types";
import { useHtmlBigImage } from "./useHtmlBigImage";
import { setDefectColor } from "./useHtmlOverlay";

// useHtmlOverlay返却値
export interface UseHtmlDefects {
	overlay: UseHtmlBigImage;
	defect: UseHtmlBigImage;
	Reload: () => void;
	Resize: (scale: number) => void;
}

/**
 * custom hook defects画像
 * @returns UseHtmlOverlay
 */
export const useHtmlDefects = (dispDefects: DefectRecord[]): UseHtmlDefects => {
	const overlay = useHtmlBigImage(null, null);
	const defect = useHtmlBigImage(null, null);

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

		// ImageDataの格納先を作成
		const defectImageData = overlayCtx.createImageData(imgWidth, imgHeight);

		// Overlay画像解析処理
		for (let r = 0, len = overlayImageData.data.length; r < len; r += 4) {
			if (overlayImageData.data[r] > 0) {
				// 表示対象Defect
				if (
					dispDefects.some(
						(defect) => defect.defectNo === overlayImageData.data[r],
					)
				) {
					setDefectColor(defectImageData.data, r);
				}
			}
		}

		// ImageDataをCanvasタグに設定後、Imgタグのsrcとして設定
		defect.SetImageData(defectImageData, "image/png");
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
	};

	return {
		overlay,
		defect,
		Reload,
		Resize,
	};
};
