import { atom, useAtomValue } from "jotai";
import { loadable } from "jotai/utils";
import { Point } from "pixi.js";
import { useCallback } from "react";
import type { InspectionAreaDrawParam } from "~/features/integrated-viewer-map/types";
import { resultsRecordSelector } from "~/features/misc/hooks/useResultName";

import { getIdw } from "../api/getIdw";
import type { Idw } from "../types";

const DEF_MFOV = new Point(44, 44);
const DEF_SFOV = new Point(4, 4);

/**
 * Idwを管理
 * あちこちで使用するのでexport
 */
export const idwSelector = atom(async (get): Promise<Idw | undefined> => {
	const resultRecord = await get(resultsRecordSelector);
	if (resultRecord == null || resultRecord.toolData.length === 0) {
		return undefined;
	}
	const controller = new AbortController();
	return await getIdw(resultRecord.toolData, controller.signal)
		.then((res) => res)
		.catch((error) => {
			if (error.name !== "AbortError") {
				console.error("getIdw fetch fail.", error);
			}
			return undefined;
		});
});
const idwLoadableSelector = loadable(idwSelector);

const inspectionAreasSelector = atom(
	async (get): Promise<InspectionAreaDrawParam[]> => {
		const idw = await get(idwSelector);
		if (idw == null || idw.inspectionArea.length === 0) return [];
		return idw.inspectionArea
			.map((i) => {
				return i.chips.map((chip) => {
					return {
						areaNo: i.no,
						drawChipIndex: new Point(
							chip.x + idw.mapOrigin.x,
							idw.chipArray.y - 1 - chip.y - idw.mapOrigin.y,
						),
						idwCoordinateMinX: i.coordinate[0],
						idwCoordinateMinY: i.coordinate[1],
						idwCoordinateMaxX: i.coordinate[2],
						idwCoordinateMaxY: i.coordinate[3],
					};
				});
			})
			.reduce((prev, current) => prev.concat(current), []);
	},
);
const inspectionAreasLoadableSelector = loadable(inspectionAreasSelector);

/**
 * InspectionAreaリストを取得
 */
export const useInspectionAreas = (
	drawChipIndex?: Point,
): {
	inspectionAreas: InspectionAreaDrawParam[];
} => {
	const inspectionAreasLoadable = useAtomValue(inspectionAreasLoadableSelector);

	if (inspectionAreasLoadable.state !== "hasData") {
		return { inspectionAreas: [] };
	}
	const inspectionAreas = inspectionAreasLoadable.data;
	if (drawChipIndex == null) return { inspectionAreas };
	return {
		inspectionAreas: inspectionAreas.filter((i) =>
			i.drawChipIndex.equals(drawChipIndex),
		),
	};
};

// useIdw返却値
interface UseIdw {
	idw: Idw | undefined;

	/**
	 * IDWに則したChip座標取得処理(中央が(0,0))
	 * @param drawChipIndex: 左上始点のChip座標
	 * @returns IDW情報を考慮したX, Y座標オブジェクト
	 */
	toIdwChipIndex: (drawChipIndex: Point) => Point;

	/**
	 * 描画上のChip座標取得処理(左上が(0,0)。中央は(7,7):idw.map.origin)
	 * @param idwChipIndex: IDWに則したChip座標
	 * @returns 描画上のX, Y座標オブジェクト
	 */
	toDrawChipIndex: (idwChipIndex: Point) => Point;

	/**
	 * 描画座標を使用した描画上のChip座標取得処理(左上が(0,0)。中央は(7,7):idw.map.origin)
	 * @param worldpoint: 描画上の座標
	 * @param chipSizeX: 1chipの pixel数(横)
	 * @param chipSizeY: 1chipの pixel数(縦)
	 * @returns 描画上のX, Y座標オブジェクト
	 */
	calcDrawChipIndex: (
		worldPoint: Point,
		chipSizeX: number,
		chipSizeY: number,
	) => Point;

	/**
	 * IDW座標を使用した描画座標取得処理(左上基準のChip内座標)
	 * @param pixelSizeX: 1chipのPixel数(横)
	 * @param pixelSizeY: 1chipのPixel数(縦)
	 * @param fovPoint: Idw座標
	 * @returns 描画上のX, Y座標オブジェクト
	 */
	toDrawChipPoint: (
		pixelSizeX: number,
		pixelSizeY: number,
		fovPoint: Point,
	) => Point;

	/**
	 * mFOVのPixelサイズ取得処理
	 * @param no: 対象MFovのArea No
	 * @param point: 1chipのPixel数
	 */
	getMFovPixSize: (no: number, point: Point) => Point;

	/**
	 * sFOVのPixelサイズ取得処理
	 * @param no: 対象SFovのArea No
	 * @param point: 1chipのPixel数
	 */
	getSFovPixSize: (no: number, point: Point) => Point;

	/**
	 * sFOVのサイズ取得処理
	 * @param chipX: 対象sFovのchipのx座標
	 * @param chipY: 対象sFovのchipのy座標
	 */
	getSFovSize: (
		chipX: number,
		chipY: number,
	) => { x: number; y: number } | undefined;
}

export const useIdw = (): UseIdw => {
	const idwLoadable = useAtomValue(idwLoadableSelector);
	const idw = idwLoadable.state === "hasData" ? idwLoadable.data : undefined;
	// IDWに則したChip座標取得処理(中央が(0,0))
	const toIdwChipIndex = useCallback(
		(drawChipIndex: Point): Point => {
			if (idw == null) return drawChipIndex;

			const xIndex = drawChipIndex.x - idw.mapOrigin.x;
			const yIndex = idw.chipArray.y - 1 - drawChipIndex.y - idw.mapOrigin.y;

			return new Point(xIndex, yIndex);
		},
		[idw],
	);

	// 描画上のChip座標取得処理(左上が(0,0))
	const toDrawChipIndex = useCallback(
		(idwChipIndex: Point): Point => {
			if (idw == null) return idwChipIndex;

			const xIndex = idwChipIndex.x + idw.mapOrigin.x;
			const yIndex = idw.chipArray.y - 1 - idwChipIndex.y - idw.mapOrigin.y;

			return new Point(xIndex, yIndex);
		},
		[idw],
	);

	// 描画座標を使用した描画上のChip座標取得処理
	const calcDrawChipIndex: (
		worldPoint: Point,
		chipSizeX: number,
		chipSizeY: number,
	) => Point = useCallback(
		(worldPoint: Point, chipSizeX: number, chipSizeY: number) => {
			if (idw == null) return worldPoint;

			return new Point(
				Math.floor(worldPoint.x / chipSizeX),
				Math.floor(worldPoint.y / chipSizeY),
			);
		},
		[idw],
	);

	// IDW座標を使用した描画座標取得処理(左上基準のChip内座標。sFOVはY軸反転の必要あり。)
	const toDrawChipPoint: (
		pixelSizeX: number,
		pixelSizeY: number,
		fovPoint: Point,
	) => Point = useCallback(
		(pixelSizeX: number, pixelSizeY: number, fovPoint: Point) => {
			if (idw == null) return fovPoint;

			const scaleX = pixelSizeX / idw.chipPitch.x;
			const scaleY = pixelSizeY / idw.chipPitch.y;

			// X座標計算 Pixel変換座標
			const x = fovPoint.x * scaleX;
			// Y座標計算 Pixel変換座標
			const y = fovPoint.y * scaleY;

			return new Point(x, y);
		},
		[idw],
	);

	// MFOVのPixelサイズを取得する。
	const getMFovPixSize = useCallback(
		(no: number, point: Point): Point => {
			if (idw == null || idw.inspectionArea.length === 0) return DEF_MFOV;
			const area = idw.inspectionArea.find((area) => no === area.no);

			if (area == null || area.mFOVSize == null) return DEF_MFOV;

			const xPixel = point.x * (area.mFOVSize.x / idw.chipPitch.x);
			const yPixel = point.y * (area.mFOVSize.y / idw.chipPitch.y);

			return new Point(xPixel, yPixel);
		},
		[idw],
	);

	// SFOVのPixelサイズを取得する。
	const getSFovPixSize = useCallback(
		(no: number, point: Point): Point => {
			if (idw == null || idw.inspectionArea.length === 0) return DEF_SFOV;
			const area = idw.inspectionArea.find((area) => no === area.no);

			if (area == null || area.sFOVSize == null) return DEF_SFOV;

			const xPixel = point.x * (area.sFOVSize.x / idw.chipPitch.x);
			const yPixel = point.y * (area.sFOVSize.y / idw.chipPitch.y);

			return new Point(xPixel, yPixel);
		},
		[idw],
	);

	// sFOVのサイズを取得する。
	const getSFovSize = useCallback(
		(chipX: number, chipY: number): { x: number; y: number } | undefined => {
			if (idw == null || idw.inspectionArea.length === 0) return undefined;
			return idw.inspectionArea.find((a) =>
				a.chips.some((f) => f.x === chipX && f.y === chipY),
			)?.sFOVSize;
		},
		[idw],
	);

	return {
		idw,
		toIdwChipIndex,
		toDrawChipIndex,
		calcDrawChipIndex,
		toDrawChipPoint,
		getMFovPixSize,
		getSFovPixSize,
		getSFovSize,
	};
};
