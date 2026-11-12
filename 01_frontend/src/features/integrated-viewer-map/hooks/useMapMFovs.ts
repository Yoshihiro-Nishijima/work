import { atom, useAtomValue } from "jotai";
import { Point } from "pixi.js";
import { useCallback, useEffect, useState } from "react";

import { getMFov } from "~/features/map/api/getMFov";
import { useIdw } from "~/features/map/hooks";
import { resultNameAtom } from "~/features/misc/hooks/useResultName";

import { useAtomCallback } from "jotai/utils";
import { extractApiErrorInfo } from "~/lib/extractApiErrorMessage";
import type { ChipMFov } from "../types";
import { useChipMapInfo } from "./useChipMapInfo";
import { isMFovHexDisplayLevel, useMapInfo } from "./useMapInfo";

// Map描画用 MFovリストAtom
// 一旦格納したらキャッシュの意味で保持し続ける (TODO リソース的に問題になりそうなら保持上限を決める)
export const chipMFovsAtom = atom<ChipMFov[]>([]);

const toPointKey = (p: Point) => `${p.x},${p.y}`;

interface UseMapMFovs {
	mapMFovs: ChipMFov[];
}
/**
 * Map描画用の MFovリストを管理
 * @returns Map描画用 MFovリスト
 */
export const useMapMFovs = (): UseMapMFovs => {
	const { toIdwChipIndex, calcDrawChipIndex } = useIdw();
	const { displayViewArea } = useMapInfo();
	const { chipMapInfo } = useChipMapInfo();
	const disableMFovHex = !isMFovHexDisplayLevel();

	// APIから取得したデータ保持用(取得した分だけ保持)
	// MFovHexの描画対象Chipindexは useMemo で算出する
	const chipMFovs = useAtomValue(chipMFovsAtom);

	// 表示範囲が更新されたらmFOV取得対象Chipリストを更新
	// mFOV取得対象Chipリスト
	const [drawChipList, setDrawChipList] = useState<Point[]>([]);

	useEffect(() => {
		if (disableMFovHex) {
			setDrawChipList([]);
			return;
		}
		if (
			displayViewArea.leftTopPoint.x === 0 &&
			displayViewArea.leftTopPoint.y === 0 &&
			displayViewArea.rightBottomPoint.x === 0 &&
			displayViewArea.rightBottomPoint.y === 0
		) {
			setDrawChipList([]);
			return;
		}
		// 表示範囲のChip取得
		const start = calcDrawChipIndex(
			displayViewArea.leftTopPoint,
			chipMapInfo.pixelSizeX,
			chipMapInfo.pixelSizeY,
		);
		const end = calcDrawChipIndex(
			displayViewArea.rightBottomPoint,
			chipMapInfo.pixelSizeX,
			chipMapInfo.pixelSizeY,
		);
		const prevChipIndexSet = new Set(
			chipMFovs.map((m) => toPointKey(m.chipIndex)),
		);
		const drawChipList: Point[] = [];
		for (let x = start.x; x <= end.x; x++) {
			for (let y = start.y; y <= end.y; y++) {
				const chipIndex = toIdwChipIndex(new Point(x, y));
				if (prevChipIndexSet.has(toPointKey(chipIndex))) continue;
				drawChipList.push(chipIndex);
			}
		}
		setDrawChipList(drawChipList);
	}, [
		displayViewArea,
		chipMapInfo,
		disableMFovHex,
		chipMFovs,
		toIdwChipIndex,
		calcDrawChipIndex,
	]);

	const updateMapMfovs = useAtomCallback(
		useCallback(async (get, set, drawChipIndex: Point[]) => {
			const resultName = get(resultNameAtom);
			const prevMFovs = get(chipMFovsAtom);
			const newMFovs: ChipMFov[] = [];
			const controller = new AbortController();
			try {
				for (const chipIndex of drawChipIndex) {
					const mFovList = await getMFov(
						{
							resultName,
							chipIndex,
						},
						controller.signal,
					);
					newMFovs.push({ chipIndex, mFovList });
				}
			} catch (error) {
				const res = await extractApiErrorInfo(error);
				if (res.aborted) return;
				console.error("getMFov fetch fail.", res.status, res.message);
			} finally {
				controller.abort();
			}
			if (newMFovs.length === 0) return;
			set(chipMFovsAtom, [...prevMFovs, ...newMFovs]);
		}, []),
	);

	useEffect(() => {
		if (drawChipList.length === 0) return;
		updateMapMfovs(drawChipList);
		setDrawChipList([]);
	}, [drawChipList, updateMapMfovs]);

	return { mapMFovs: chipMFovs };
};
