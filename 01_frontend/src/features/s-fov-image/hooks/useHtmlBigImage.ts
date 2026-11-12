import { useRef } from "react";

import type { UseHtmlBigImage } from "../types";

/**
 * custom hook htmlタグ (canvas, img)
 * @returns
 */
export const useHtmlBigImage = (
	initialValueImage: HTMLImageElement | null,
	initialValueCanvas: HTMLCanvasElement | null,
): UseHtmlBigImage => {
	const imgRef = useRef<HTMLImageElement>(initialValueImage);
	const canvasRef = useRef<HTMLCanvasElement>(initialValueCanvas);

	// HTMLImageElement取得
	const GetElmImg = (): HTMLImageElement | null => {
		return imgRef.current;
	};

	// HTMLCanvasElement取得
	const GetElmCanvas = (): HTMLCanvasElement | null => {
		return canvasRef.current;
	};

	// CanvasContext取得
	const GetContext = (): CanvasRenderingContext2D | null => {
		const canvas = GetElmCanvas();
		if (canvas == null) return null;

		return canvas.getContext("2d");
	};

	// img complete取得
	const GetComplete = (): boolean => {
		const img = GetElmImg();
		if (img == null) return false;

		return img.complete;
	};

	// Imgサイズ設定処理
	const SetSizeImg = (width: number, height: number, scale?: number): void => {
		const image = GetElmImg();
		if (image == null) return;

		if (scale != null) {
			image.width = width * scale;
			image.height = height * scale;
		} else {
			image.width = width;
			image.height = height;
		}
	};

	// Imgサイズ設定処理
	const SetSizeCanvas = (width: number, height: number): void => {
		const canvas = GetElmCanvas();
		if (canvas == null) return;

		canvas.width = width;
		canvas.height = height;
	};

	// Canvas HtmlElement取得
	const SetImageData = (
		imageData: ImageData,
		type?: string | undefined,
	): void => {
		const img = GetElmImg();
		const canvas = GetElmCanvas();
		const ctx = GetContext();
		if (img == null || canvas == null || ctx == null) return;

		// Elementのサイズを更新
		SetSizeImg(imageData.width, imageData.height);
		SetSizeCanvas(imageData.width, imageData.height);

		// ImageDataをCanvasに描画して画像化
		ctx.putImageData(imageData, 0, 0);
		img.src = canvas.toDataURL(type);
	};

	return {
		imgRef,
		canvasRef,
		GetElmImg,
		GetContext,
		GetComplete,
		SetSizeImg,
		SetSizeCanvas,
		SetImageData,
	};
};
