import { atom, useAtom, useAtomValue } from "jotai";
import { useAtomCallback } from "jotai/utils";
import { Point } from "pixi.js";
import {
	type Dispatch,
	type SetStateAction,
	useCallback,
	useMemo,
} from "react";

import type { MFov } from "~/features/map/types";

import { useMapSelectionStatus } from "~/features/misc/hooks/useMapSelectionStatus";
import type { DisplayPoint, DisplayViewArea } from "../types";

export const MAP_DEFAULT_SCALE = 1; //2882.55033; // mFOV全体を表示する倍率を設定
export const MAP_MAX_SCALE = 45000; // TODO MAPの最大拡大率を設定
export const MAP_MIN_SCALE = 1; // MAPの最小拡大率を設定
export const COLORMAP_SHOW_THRESHOLD = 5; // COLORMAPを表示する倍率閾値（5倍未満でCOROLMAP表示）

const MAP_DEFECT_LV2_SCALE = 50; // TODO Defectを少し細かく取得する倍率
export const MAP_DRAW_SFOV_THUMBNAIL = 1500; // TODO SFovサムネイルを描画する倍率を設定

const MAP_DRAW_MFOV_SCALE = 12; // TODO MFovの6角形を描画する倍率を設定

export const TRAINING_MODE_MAP_MIN_SCALE = MAP_DRAW_MFOV_SCALE; // Training Mode 時のMAPの最小拡大率を設定

export const scaleAtom = atom(MAP_DEFAULT_SCALE);

export const defectDisplayLevelSelector = atom((get) => {
	const scale = get(scaleAtom);
	// TODO 倍率と欠陥情報表示レベルの対応を設定
	if (scale >= MAP_DRAW_SFOV_THUMBNAIL) return "MFovMap";
	if (scale >= MAP_DEFECT_LV2_SCALE) return "ChipMapLv2";
	if (scale >= COLORMAP_SHOW_THRESHOLD) return "ChipMapLv1";
	return "WaferMap";
});

const displayViewAreaAtom = atom<DisplayViewArea>({
	leftTopPoint: new Point(),
	rightBottomPoint: new Point(),
});

/** Map表示範囲の中心座標 */
const displayCenterPointAtom = atom(new Point());

/** sFOVサムネイル描画対象 mFOV座標 管理用Map K: mFovNo V:mFov 座標情報
 * (座標計算にも使用するため、描画済みのものも含めて保持)
 */
const mFovDrawInfoMapForSFovAtom = atom(new Map<number, MFovDrawInfo>());

/** mFov描画用座標情報 */
export type MFovDrawInfo = Pick<MFov, "mfovX" | "mfovY" | "areaNo">;

/** WaferMap(のColorMap)表示レベルか否か */
const isWaferColorMapDisplayLevelSelector = atom((get) => {
	return get(defectDisplayLevelSelector) === "WaferMap";
});
// Map部のCHIP境界の基準となる線の太さ
const BASE_CHIP_LINE_THICKNESS = 2;
// Map部のCHIP境界の基準となる線の比率（大きいほど線が細くなる）
const BASE_CHIP_LINE_RATIO = 2;
// Map部のCHIP境界線の太さが変わる基準倍率(WaferMapレベル描画時以外)
const CHANGE_THICKNESS_CHIP_LINE_RATIO = 50;
/** Chip境界線の太さをScaleから計算 */
const chipLineThicknessAtom = atom((get) => {
	const scale = get(scaleAtom);
	// Scaleについて、WaferMapレベル(倍率1～4)かChipMapレベル以上かで場合分けして値を設定
	//   WaferMapレベル(COLORMAP_SHOW_THRESHOLD(=5)未満) : 線が細くなりすぎるので等倍計算
	if (scale < COLORMAP_SHOW_THRESHOLD) return BASE_CHIP_LINE_THICKNESS;

	//   ChipMapレベル以上： CHANGE_THICKNESS_CHIP_LINE_RATIO倍毎に線を細くしていく計算にて見かけを補正
	return (
		BASE_CHIP_LINE_THICKNESS /
		(BASE_CHIP_LINE_RATIO * Math.ceil(scale / CHANGE_THICKNESS_CHIP_LINE_RATIO))
	);
});

interface UseWaferMapinfo {
	chipLineThickness: number;
	enabledWaferColorMap: boolean;
}
/** WaferMap表示用パラメータ管理 */
export const useWaferMapInfo = (): UseWaferMapinfo => {
	const chipLineThickness = useAtomValue(chipLineThicknessAtom);
	const enabledWaferColorMap = useAtomValue(
		isWaferColorMapDisplayLevelSelector,
	);
	return { chipLineThickness, enabledWaferColorMap };
};

/** ChipMap表示レベルか否か */
const isChipDisplayLevelSelector = atom((get) => {
	return ["ChipMapLv1", "ChipMapLv2"].includes(get(defectDisplayLevelSelector));
});
export const isChipMapDisplayLevel = (): boolean => {
	return useAtomValue(isChipDisplayLevelSelector);
};

/** mFovHex表示レベルか否か */
const isMFovHexDisplayLevelSelector = atom((get) => {
	return get(scaleAtom) >= MAP_DRAW_MFOV_SCALE;
});
export const isMFovHexDisplayLevel = (): boolean => {
	return useAtomValue(isMFovHexDisplayLevelSelector);
};

/** sFovサムネイル表示レベルか否か */
const isSFovThumbnailDisplayLevelSelector = atom((get) => {
	return get(scaleAtom) >= MAP_DRAW_SFOV_THUMBNAIL;
});
export const isSFovThumbnailDisplayLevel = () => {
	return useAtomValue(isSFovThumbnailDisplayLevelSelector);
};

interface UseMapDisplay {
	/** 表示範囲の中心座標 */
	displayCenterPoint: Point;
	/**
	 * 選択中sFov/Defectへ表示範囲移動可否
	 * 選択中sFov/Defectがあり、表示範囲内に含まれていない場合はtrue
	 */
	enableMoveSelectedObjPoint: boolean;
	/** 選択中sFov/Defectへ表示範囲を移動 */
	moveSelectedObjPoint: () => void;
	/** 表示範囲の中心座標をセット */
	setDisplayCenterPoint: Dispatch<SetStateAction<Point>>;
}
/** Mapエリア表示範囲操作 */
export const useMapDisplay = (): UseMapDisplay => {
	const displayViewArea = useAtomValue(displayViewAreaAtom);
	const [displayCenterPoint, setDisplayCenterPoint] = useAtom(
		displayCenterPointAtom,
	);
	const { selectedSfovPixelPoint, selectedDefectPixelPoint } =
		useMapSelectionStatus();

	const existsSelectedObj =
		selectedSfovPixelPoint != null || selectedDefectPixelPoint != null;
	const selectedObjPoint = new Point();
	if (selectedSfovPixelPoint != null) {
		selectedObjPoint.set(selectedSfovPixelPoint.x, selectedSfovPixelPoint.y);
	} else if (selectedDefectPixelPoint != null) {
		selectedObjPoint.set(
			selectedDefectPixelPoint.x,
			selectedDefectPixelPoint.y,
		);
	}
	// 表示範囲内に選択中sFov/Defectが表示されているか否か
	const includeSelectedObjPoint =
		existsSelectedObj &&
		displayViewArea.leftTopPoint.x < selectedObjPoint.x &&
		displayViewArea.rightBottomPoint.x > selectedObjPoint.x &&
		displayViewArea.leftTopPoint.y < selectedObjPoint.y &&
		displayViewArea.rightBottomPoint.y > selectedObjPoint.y;

	const enableMoveSelectedObjPoint = useMemo(() => {
		return existsSelectedObj && !includeSelectedObjPoint;
	}, [existsSelectedObj, includeSelectedObjPoint]);

	const moveSelectedObjPoint = () => {
		if (!enableMoveSelectedObjPoint) return;
		setDisplayCenterPoint(selectedObjPoint);
	};

	return {
		displayCenterPoint,
		enableMoveSelectedObjPoint,
		moveSelectedObjPoint,
		setDisplayCenterPoint,
	};
};

// mFOV HEX境界の基準となる線の太さ
const BASE_MFOV_HEX_LINE_THICKNESS = 0.1;
// mFOV HEX境界の基準となる線の比率（大きいほど線が細くなる）
const BASE_MFOV_HEX_LINE_RATIO = 3;
// mFOV HEX境界の線の太さが変わる基準倍率
const CHANGE_THICKNESS_MFOV_HEX_LINE_RATIO = 50;
/** mFOV Hex境界線の太さをScaleから計算 */
const mFovHexLineThicknessAtom = atom((get) => {
	const scale = get(scaleAtom);
	// Scaleについて、CHANGE_THICKNESS_MFOV_HEX_LINE_RATIOに線を細くしていく計算にて見かけを補正
	return (
		BASE_MFOV_HEX_LINE_THICKNESS /
		(BASE_MFOV_HEX_LINE_RATIO *
			Math.ceil(scale / CHANGE_THICKNESS_MFOV_HEX_LINE_RATIO))
	);
});
interface UseMFovMapInfo {
	mFovHexLineThickness: number;
}
/** mFovMap表示用パラメータ管理 */
export const useMFovMapInfo = (): UseMFovMapInfo => {
	const mFovHexLineThickness = useAtomValue(mFovHexLineThicknessAtom);
	return { mFovHexLineThickness };
};

// 欠陥点の半径を表示倍率に合わせて調整
const DEFECTS_POINT_RADIUS = 1;
const defectPointRadiusSelector = atom((get) => {
	const scale = get(scaleAtom);
	if (scale <= COLORMAP_SHOW_THRESHOLD) {
		return (DEFECTS_POINT_RADIUS * 0.5) / scale;
	}
	if (scale <= MAP_DEFECT_LV2_SCALE) {
		return (DEFECTS_POINT_RADIUS * 0.8) / scale;
	}
	if (scale <= MAP_DEFECT_LV2_SCALE * 3) {
		return (DEFECTS_POINT_RADIUS * 2) / scale;
	}
	if (scale <= MAP_DRAW_SFOV_THUMBNAIL) {
		return (DEFECTS_POINT_RADIUS * 1.5) / scale;
	}
	return DEFECTS_POINT_RADIUS / scale;
});
interface UseDefectMapInfo {
	defectPointRadius: number;
	defectEmphasisPointRadius: number;
}
export const useDefectMapInfo = (): UseDefectMapInfo => {
	const defectPointRadius = useAtomValue(defectPointRadiusSelector);
	const defectEmphasisPointRadius = defectPointRadius * 1.5;

	return { defectPointRadius, defectEmphasisPointRadius };
};

interface UseMapInfo {
	scale: number;
	setScale: Dispatch<SetStateAction<number>>;
	displayViewArea: DisplayViewArea;
	setMapDisplayPoint: (displayPoint: DisplayPoint) => void;
	mFovDrawInfoForSFovMap: Map<number, MFovDrawInfo>;
	updateDrawMFovPointInfos: (value: Map<number, MFovDrawInfo>) => void;
}
/** Mapエリア表示用パラメータ管理 */
export const useMapInfo = (): UseMapInfo => {
	const [mFovDrawInfoForSFovMap, setMFovDrawInfoMapForSFov] = useAtom(
		mFovDrawInfoMapForSFovAtom,
	);
	const [scale, setScale] = useAtom(scaleAtom);
	const displayViewArea = useAtomValue(displayViewAreaAtom);

	const updateDrawMFovPointInfos = useCallback(
		(value: Map<number, MFovDrawInfo>): void => {
			const newMap = new Map(mFovDrawInfoForSFovMap);
			value.forEach((v, k) => {
				newMap.set(k, v);
			});
			setMFovDrawInfoMapForSFov(newMap);
		},
		[setMFovDrawInfoMapForSFov, mFovDrawInfoForSFovMap],
	);

	const setMapDisplayPoint: (displayPoint: DisplayPoint) => void =
		useAtomCallback(
			useCallback((_get, set, displayPoint: DisplayPoint) => {
				set(displayViewAreaAtom, {
					leftTopPoint: new Point(
						displayPoint.canvasMinX,
						displayPoint.canvasMinY,
					),
					rightBottomPoint: new Point(
						displayPoint.canvasMaxX,
						displayPoint.canvasMaxY,
					),
				});
			}, []),
		);

	return {
		scale,
		setScale,
		displayViewArea,
		setMapDisplayPoint,
		updateDrawMFovPointInfos,
		mFovDrawInfoForSFovMap,
	};
};
