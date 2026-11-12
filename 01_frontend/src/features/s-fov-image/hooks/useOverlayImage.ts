import { useEffect, useMemo, useState } from "react";
import { useResultJobType } from "~/features/misc/hooks/useResultsJobType";
import type { Size } from "~/features/misc/types";
import type { JobType } from "~/features/recipe/types";

/**
 * カラー設定
 * @param data 8bitデータ
 * @param index インデックス
 * @param rgba 設定色(RGBA)
 */
const setColor = (
	data: Uint8ClampedArray,
	index: number,
	rgba: number[],
): void => {
	data[index] = rgba[0];
	data[index + 1] = rgba[1];
	data[index + 2] = rgba[2];
	data[index + 3] = rgba[3];
};

/**
 * 透明設定
 * @param data 8bitデータ
 * @param index インデックス
 */
export const setTransparent = (
	data: Uint8ClampedArray,
	index: number,
): void => {
	if (data.length < 4 || data.length <= index) return;
	setColor(data, index, [0, 0, 0, 0]);
};

/**
 * Defectカラー設定
 * @param data 8bitデータ
 * @param index インデックス
 */
export const setDefectColor = (
	data: Uint8ClampedArray,
	index: number,
): void => {
	if (data.length < 4 || data.length <= index) return;
	setColor(data, index, [255, 0, 0, 255]);
};

/**
 * DesignReferenceカラー設定
 * @param data 8bitデータ
 * @param index インデックス
 */
const setDesignReferenceColor = (
	data: Uint8ClampedArray,
	index: number,
): void => {
	setColor(data, index, [128, 0, 255, 255]);
};

/**
 * DesignTargetカラー設定
 * @param data 8bitデータ
 * @param index インデックス
 */
const setDesignTargetColor = (data: Uint8ClampedArray, index: number): void => {
	setColor(data, index, [0, 255, 128, 255]);
};

/**
 * DesignLowerカラー設定
 * @param data 8bitデータ
 * @param index インデックス
 */
const setDesignLowerColor = (data: Uint8ClampedArray, index: number): void => {
	setColor(data, index, [0, 255, 255, 255]);
};

/**
 * Box/Segmentカラー取得関数
 * @param data 8bitデータ
 * @param index インデックス
 * @param jobType ジョブタイプ
 */
const setBoxSegmentColor = (
	data: Uint8ClampedArray,
	index: number,
	jobType?: JobType,
): void => {
	switch (jobType) {
		case "Trainable D2DB":
		case "D2D":
		case "C2C":
			// Box色設定
			setColor(data, index, [255, 0x33, 0x99, 0xff]);
			return;
		case "Trainable D2D":
			// Segment色設定(仮)
			setColor(data, index, [255, 0x33, 0x99, 0xff]);
			return;
		default:
			return;
	}
};

interface UseOverlayImage {
	defectImgURL?: string;
	designImgURL?: string;
	boxSegmentImgURL?: string;
	size: Size;
}
/**
 * オーバーレイ画像から各レイヤ用画像を生成してURLと画像サイズを取得
 * @param overlayImgURL overlay画像URL
 * @returns defect/DesignData/BoxSegment画像のURLおよび画像サイズ
 */
export const useOverlayImage = (overlayImgURL: string): UseOverlayImage => {
	const { jobType } = useResultJobType();
	const [overlayImageData, setOverlayImageData] = useState<ImageData>();

	useEffect(() => {
		// overlay画像読込
		if (overlayImgURL === "") {
			setOverlayImageData(undefined);
			return;
		}

		const img = new Image();
		img.src = overlayImgURL;
		img.onload = () => {
			const overlayCanvas = document.createElement("canvas");
			const overlayCtx = overlayCanvas.getContext("2d");
			if (overlayCtx == null) return;

			const { width, height } = img;
			overlayCanvas.width = width;
			overlayCanvas.height = height;

			overlayCtx.drawImage(img, 0, 0);
			setOverlayImageData(overlayCtx.getImageData(0, 0, width, height));
		};

		return () => {
			img.onload = null;
		};
	}, [overlayImgURL]);

	return useMemo(() => {
		// overlay画像を元に各種画像を生成
		if (!overlayImageData) {
			return { size: { width: 0, height: 0 } };
		}

		const defectCanvas = document.createElement("canvas");
		const designCanvas = document.createElement("canvas");
		const boxSegmentCanvas = document.createElement("canvas");
		const defectCtx = defectCanvas.getContext("2d");
		const designCtx = designCanvas.getContext("2d");
		const boxSegmentCtx = boxSegmentCanvas.getContext("2d");
		if (!defectCtx || !designCtx || !boxSegmentCtx) {
			return { size: { width: 0, height: 0 } };
		}

		const { data: overlayData, width, height } = overlayImageData;
		defectCanvas.width = width;
		defectCanvas.height = height;
		designCanvas.width = width;
		designCanvas.height = height;
		boxSegmentCanvas.width = width;
		boxSegmentCanvas.height = height;

		const defectImgData = defectCtx.createImageData(width, height);
		const designImgData = designCtx.createImageData(width, height);
		const boxSegmentImgData = boxSegmentCtx.createImageData(width, height);

		for (let r = 0, len = overlayData.length; r < len; r += 4) {
			// 1,2,3,6bitが 0 かつ 7bitが 1 の場合はoverlay表示対象が無いので透過
			if (
				(overlayData[r] & 0b00100111) === 0 &&
				(overlayData[r] & 0b01000000) !== 0
			) {
				setTransparent(defectImgData.data, r);
				setTransparent(designImgData.data, r);
				setTransparent(boxSegmentImgData.data, r);
				continue;
			}

			if ((overlayData[r] & 0b00100000) !== 0) {
				// Defect(6bit)
				setDefectColor(defectImgData.data, r);
			} else if ((overlayData[r] & 0b01000000) === 0) {
				// Box/Segment(7bit)
				setBoxSegmentColor(boxSegmentImgData.data, r, jobType);
			}

			if ((overlayData[r] & 0b00000100) !== 0) {
				// Design Reference(3bit)
				setDesignReferenceColor(designImgData.data, r);
			} else if ((overlayData[r] & 0b00000010) !== 0) {
				// Design Lower(2bit)
				setDesignLowerColor(designImgData.data, r);
			} else if ((overlayData[r] & 0b00000001) !== 0) {
				// Design Target(1bit)
				setDesignTargetColor(designImgData.data, r);
			}
		}

		defectCtx.putImageData(defectImgData, 0, 0);
		designCtx.putImageData(designImgData, 0, 0);
		boxSegmentCtx.putImageData(boxSegmentImgData, 0, 0);

		return {
			defectImgURL: defectCanvas.toDataURL(),
			designImgURL: designCanvas.toDataURL(),
			boxSegmentImgURL: boxSegmentCanvas.toDataURL(),
			size: { width, height },
		};
	}, [overlayImageData, jobType]);
};
