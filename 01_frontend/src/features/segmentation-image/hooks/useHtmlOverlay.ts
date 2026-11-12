import { segmentationColorNumList } from "~/features/recipe/types";

import { useHtmlBigImage } from "../../s-fov-image/hooks/useHtmlBigImage";
import type { UseHtmlBigImage } from "../../s-fov-image/types";

/**
 * カラー設定関数
 * @param data 8bitデータ
 * @param index インデックス
 * @param color 設定カラー
 */
function setColor(data: Uint8ClampedArray, index: number, color: number): void {
	data[index] = color >> 16;
	data[index + 1] = (color >> 8) & 0xff;
	data[index + 2] = color & 0xff;
	data[index + 3] = 0xff;
}

// useHtmlOverlay返却値
interface UseHtmlOverlay {
	overlay: UseHtmlBigImage;
	segmentation: UseHtmlBigImage;
	Reload: () => void;
	Resize: (scale: number) => void;
}

/**
 * custom hook Overlay画像
 * @returns UseHtmlOverlay
 */
export const useHtmlOverlay = (): UseHtmlOverlay => {
	const overlay = useHtmlBigImage(null, null);
	const segmentation = useHtmlBigImage(null, null);

	// HTMLImageElement取得
	const Reload = (): void => {
		const overlayImage = overlay.GetElmImg();
		const overlayCtx = overlay.GetContext();
		if (overlayImage == null || !overlay.GetComplete() || overlayCtx == null) {
			return;
		}

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
		const segmentationImageData = overlayCtx.createImageData(
			imgWidth,
			imgHeight,
		);

		// Overlay画像解析処理
		for (let r = 0, len = overlayImageData.data.length; r < len; r += 4) {
			setColor(
				segmentationImageData.data,
				r,
				segmentationColorNumList[overlayImageData.data[r]],
			);
		}

		// ImageDataをCanvasタグに設定後、Imgタグのsrcとして設定
		segmentation.SetImageData(segmentationImageData, "image/png");
	};

	// Resize処理
	const Resize = (scale: number): void => {
		const overlayImage = overlay.GetElmImg();
		if (overlayImage == null) return;

		segmentation.SetSizeImg(
			overlayImage.naturalWidth,
			overlayImage.naturalHeight,
			scale,
		);
	};

	return {
		overlay,
		segmentation,
		Reload,
		Resize,
	};
};
