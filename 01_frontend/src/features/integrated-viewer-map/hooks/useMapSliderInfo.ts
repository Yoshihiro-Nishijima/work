import {
	type Dispatch,
	type SetStateAction,
	useCallback,
	useEffect,
	useState,
} from "react";

import {
	MAP_MAX_SCALE,
	MAP_MIN_SCALE,
	TRAINING_MODE_MAP_MIN_SCALE,
	useMapInfo,
} from "../hooks/useMapInfo";

/** Map Slider Scale
 * +-ボタン・スライダー操作で、15%(MAP_SCALE_RATIO=1.15)の増分比で拡縮できるようにテーブル化。
 * (マウスホイールでは、カウント数および1カウントあたりのzoom倍率(1.49071)は変えられないため近似値操作となる）
 *
 * (参考)
 *  表示倍率は、指数関数 y=1.15**x (x>=1) で計算(小数点第5位で四捨五入した近似値)。
 *  操作倍率(+-,スライダーでの増減)とは log(y,1.15) の関係(底が1.15)。
 */
const MAP_SCALE_RATIO = 1.15;
const createMapScaleTable = (): number[] => {
	const newMapScaleTable: number[] = [];
	let i = 1;
	newMapScaleTable[0] = MAP_MIN_SCALE;
	while (true) {
		newMapScaleTable[i] = MAP_SCALE_RATIO ** i;
		if (newMapScaleTable[i] >= MAP_MAX_SCALE) {
			newMapScaleTable[i] = MAP_MAX_SCALE;
			break;
		}
		i++;
	}

	return newMapScaleTable;
};
export const MAP_SCALE_TABLE = createMapScaleTable();

// Map画面上での最小スライダー操作倍率
export const MAP_MIN_OPERATION_SCALE = 1;

// Training Mode の Map画面上での最小スライダー操作倍率
let trainingModeMinScale = 1;
for (let i = 1; i <= MAP_SCALE_TABLE.length; i++) {
	if (MAP_SCALE_TABLE[i - 1] > TRAINING_MODE_MAP_MIN_SCALE) {
		trainingModeMinScale = i;
		break;
	}
}
export const TRAINING_MODE_MAP_MIN_OPERATION_SCALE = trainingModeMinScale;

// Map画面上での最大スライダー操作倍率
export const MAP_MAX_OPERATION_SCALE = MAP_SCALE_TABLE.length;

interface UseMapSliderInfo {
	mapOperationScale: number;
	setMapOperationScale: Dispatch<SetStateAction<number>>;
}

export const useMapSliderInfo = (): UseMapSliderInfo => {
	const [mapOperationScale, setMapOperationScale] = useState(1);
	const { scale } = useMapInfo();

	// MAP_SCALE_TABLEから直接設定した表示倍率の近似値検索し操作倍率インデクスを取得
	const findNearestScaleIndex = useCallback((newValue: number) => {
		let idx = 0;
		MAP_SCALE_TABLE.reduce((a, b, i) => {
			// 対象値が前回値よりも小さくなった時点で以降の値は差が大きくなるだけなので判定skip
			if (a > newValue) return a;
			if (Math.abs(b - newValue) <= Math.abs(a - newValue)) {
				idx = i;
				return b;
			}
			return a;
		});
		return idx;
	}, []);

	useEffect(() => {
		// scaleとscaleTableの値が異なる場合(初期設定やマウススクロール時)のみ更新
		if (scale === MAP_SCALE_TABLE[mapOperationScale]) return;
		setMapOperationScale(findNearestScaleIndex(scale) + 1);
	}, [scale, mapOperationScale, findNearestScaleIndex]);

	return {
		mapOperationScale,
		setMapOperationScale,
	};
};
