import { atom, useAtomValue } from "jotai";
import { useMemo } from "react";

import { getChipDefects } from "~/features/map/api/getChipDefects";
import { resultNameAtom } from "~/features/misc/hooks/useResultName";

import type { ChipDefect } from "../types";
import { idwSelector } from "./useIdw";

const DEFECT_THRESHOLD = [1, 50, 100, 500, 1000];

const CHIP_COLORS = [
	"rgb(255,255,255)",
	"rgb(255,204,204)",
	"rgb(255,153,153)",
	"rgb(255,102,102)",
	"rgb(255,51,51)",
	"rgb(255,0,0)",
];

const toColor = (defectCount: number): string => {
	for (const [idx, threshold] of DEFECT_THRESHOLD.entries()) {
		if (defectCount < threshold) return CHIP_COLORS[idx];
	}
	return CHIP_COLORS[5];
};

/**
 * Chip毎のDefect数を管理 \
 * K: Canvas座標系の X,Y座標文字列(左上原点,右下方向が正数) \
 * V: Defect数
 */
const chipColorMapAtom = atom(
	async (get): Promise<UseChipDefects["chipColorMap"]> => {
		const resultName = get(resultNameAtom);
		const idw = await get(idwSelector);
		if (resultName.length === 0 || idw == null) return new Map();
		const colorMap: UseChipDefects["chipColorMap"] = new Map();
		const controller = new AbortController();
		return await getChipDefects(resultName, controller.signal)
			.then((res: ChipDefect[]) => {
				for (const chipDefect of res) {
					if (chipDefect.defectNum == null) continue;
					// chipDefectのIdw座標系(中央原点,左/下が負数)を Canvas座標系(左上原点,右/下が正数)に変換
					// useIdw-toDrawChipIndex参照(Selector内なので直接呼べない)
					const x = chipDefect.indexX + idw.mapOrigin.x;
					const y = idw.chipArray.y - 1 - chipDefect.indexY - idw.mapOrigin.y;
					colorMap.set(`${x},${y}`, toColor(chipDefect.defectNum));
				}
				return colorMap;
			})
			.catch((error) => {
				if (error.name !== "AbortError") {
					console.error("getIdw fetch fail.", error);
				}
				return new Map();
			});
	},
);

interface UseChipDefects {
	chipColorMap: Map<string, string>;
	enableChipSet: Set<string>;
}
/**
 * Chip毎のDefect数Mapを取得 \
 * K: Canvas座標系の X,Y座標文字列(左上原点,右下方向が正数) \
 * V: Defect数
 * @returns Chip毎のDefect数Map
 */
export const useChipDefects = (): UseChipDefects => {
	const chipColorMap = useAtomValue(chipColorMapAtom);
	const enableChipSet = useMemo(
		() => new Set<string>(chipColorMap.keys()),
		[chipColorMap],
	);

	return { chipColorMap, enableChipSet };
};
