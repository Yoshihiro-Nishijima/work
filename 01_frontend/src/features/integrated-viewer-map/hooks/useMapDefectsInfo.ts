import { atom, useAtomValue, useSetAtom } from "jotai";
import { Rectangle } from "pixi.js";
import { useCallback, useEffect } from "react";

import { atomFamily, atomWithReset, useAtomCallback } from "jotai/utils";
import { getChipDefectsInfo, getChipDefectsInfoWithBinning } from "~/features/defect-list/api/getChipDefectsInfo";
import { filterQuerySelector } from "~/features/defect-list/hooks/useDefect";
import {
	type ChipMapInfo,
	useChipMapInfo,
} from "~/features/integrated-viewer-map/hooks/useChipMapInfo";
import { scaleAtom } from "~/features/integrated-viewer-map/hooks/useMapInfo";
import { idwSelector, useChipDefects } from "~/features/map/hooks";
import { resultNameAtom } from "~/features/misc/hooks/useResultName";
import { useViewportAtom } from "~/features/training-mode/hooks/useViewport";
import { extractApiErrorInfo } from "~/lib/extractApiErrorMessage";
import type { DefectPoint } from "../types";
import { QuadTree } from "../utils/QuadTree";
import { mapNotificationSetterAtom } from "./useMapNotification";

/** Defect表示レベル定義(レベルに合わせて表示Defectの密度を変える) */
const SCALE_LEVELS = [
	2_800, 2_400, 2_000, 1500, 1000, 500, 200, 100, 50, 20, 0,
];
/** SCALE_LEVELSに応じた 1chipあたりのDefect取得タイル数(1辺) */
const NUM_OF_TILES_PER_CHIP = [100, 50, 25, 16, 10, 8, 5, 4, 2, 1, 1];
const CHIP_FETCH_CONCURRENCY = 6;

/** DefectキャッシュのLRU管理用キーリスト scaleLv_tile.x_tile.y */
const defectKeysAtom = atom<string[]>([]);
const maxCacheSize = 100;
/** Map表示用DefectキャッシュAtomFamily Keyは defectKeysAtomで管理*/
const defectPointsFamily = atomFamily((key: string) => atom<DefectPoint[]>([]));

const defectQuadTreeAtom = atom<QuadTree>();

const isFetchingDefectsAtom = atom(false);

/** DefectなしタイルキャッシュAtom
 * scaleLv_tile.x_tile.y のリスト
 */
const emptyTileKeysAtom = atomWithReset<string[]>([]);

const clearCacheAtom = atom(null, (get, set) => {
	set(emptyTileKeysAtom, []);
	for (const key of get(defectKeysAtom)) set(defectPointsFamily(key), []);
	set(defectKeysAtom, []);
	set(defectQuadTreeAtom, undefined);
	set(isFetchingDefectsAtom, false);
});

/** 拡大率に応じたSCALE_LEVEL */
const scaleLvSelector = atom((get) => {
	const scale = get(scaleAtom);
	const idx = SCALE_LEVELS.findIndex((lv) => scale > lv);
	return idx >= 0 ? idx : SCALE_LEVELS.length - 1;
});

interface UseMapDefectsInfo {
	defectQuadTree?: QuadTree;
}

/**
 * Mapエリアに表示するDefect情報を管理
 * 初期表示の時点で全範囲分を保持する(お試し)
 * @returns
 */
export const useMapDefectsInfo = (disabled: boolean): UseMapDefectsInfo => {
	const { chipMapInfo } = useChipMapInfo();
	const { enableChipSet } = useChipDefects();

	const filterQuery = useAtomValue(filterQuerySelector);

	const defectQuadTree = useAtomValue(defectQuadTreeAtom);
	const isFetchingDefects = useAtomValue(isFetchingDefectsAtom);

	const clearCache = useSetAtom(clearCacheAtom);

	// biome-ignore lint/correctness/useExhaustiveDependencies: キャッシュクリアのトリガーとしてのみ、filterQueryを使用
	useEffect(() => {
		clearCache();
	}, [filterQuery]);

	// Chip毎にDefect一覧を取得して QuadTreeに追加+キャッシュ更新
	const updateCache = useAtomCallback(
		useCallback(
			async (
				get,
				set,
				enableChipSet: Set<string>,
				chipMapInfo: ChipMapInfo,
			) => {
				const startedAt = performance.now();
				if (
					disabled ||
					enableChipSet.size === 0 ||
					get(isFetchingDefectsAtom)
				) {
					console.log("[perf][useMapDefectsInfo.updateCache] skipped", {
						disabled,
						enableChipCount: enableChipSet.size,
						isFetchingDefects: get(isFetchingDefectsAtom),
					});
					return;
				}
				set(isFetchingDefectsAtom, true);
				const idw = await get(idwSelector);
				if (idw == null) {
					console.log("[perf][useMapDefectsInfo.updateCache] skipped", {
						reason: "idw is null",
						durationMs: performance.now() - startedAt,
					});
					set(isFetchingDefectsAtom, false);
					return;
				}
				const resultName = get(resultNameAtom);
				if (resultName.length === 0) {
					console.log("[perf][useMapDefectsInfo.updateCache] skipped", {
						reason: "resultName is empty",
						durationMs: performance.now() - startedAt,
					});
					set(isFetchingDefectsAtom, false);
					return;
				}
				const filterQuery = get(filterQuerySelector);
				const viewport = get(useViewportAtom);

				// QuadTreeに追加
				// 範囲はWafeMap全体
				const newQuadTree =
					// get(defectQuadTreeAtom) ??
					new QuadTree(
						new Rectangle(0, 0, viewport?.worldWidth, viewport?.worldHeight),
						// 1つの領域で管理する最大欠陥点数なので、小さすぎると領域が増えすぎてつらい
						500,
					);
				const controller = new AbortController();
				let requestedChipCount = 0;
				let fetchedDefectCount = 0;
				const fetchedChips: Array<{
					chipXY?: string;
					canvasChipY: number;
					idwChipX: number;
					defectsPerChip: Awaited<
						ReturnType<typeof getChipDefectsInfo>
					>[number]["defects"];
				}> = [];

				try {
					const chipEntries = [...enableChipSet];
					requestedChipCount = chipEntries.length;

					for (
						let start = 0;
						start < chipEntries.length;
						start += CHIP_FETCH_CONCURRENCY
					) {
						const chipChunk = chipEntries.slice(
							start,
							start + CHIP_FETCH_CONCURRENCY,
						);
						const chunkResults = await Promise.all([
							(async () => {
								const chunkStartedAt = performance.now();
								const chipRequests = chipChunk.map((chipXY) => {
									const [chipXStr, chipYStr] = chipXY.split(",");
									const canvasChipX = Number(chipXStr);
									const canvasChipY = Number(chipYStr);
									const idwChipX = canvasChipX - idw.mapOrigin.x;
									const idwChipY =
										idw.chipArray.y - 1 - canvasChipY - idw.mapOrigin.y;

									return {
										chipXY,
										canvasChipY,
										idwChipX,
										idwChipY,
									};
								});

								const batchResults = await getChipDefectsInfo(
									//const batchResults = await getChipDefectsInfoWithBinning(
									{
										resultName,
										chips: chipRequests.map((chipRequest) => ({
											chipX: chipRequest.idwChipX,
											chipY: chipRequest.idwChipY,
										})),
										filterQuery,
									},
									// defectのbinning単位：表示ピクセルから逆算して決定。大きいほど高速だが、欠陥点の位置精度が下がる。
									//10_000,
									controller.signal,
								);
								console.log(
									"[perf][useMapDefectsInfo.updateCache] batch fetched",
									{
										requestedChipCount: chipChunk.length,
										returnedChipCount: batchResults.length,
										durationMs: performance.now() - chunkStartedAt,
									},
								);

								return chipRequests.map((chipRequest, index) => ({
									chipXY: chipRequest.chipXY,
									canvasChipY: chipRequest.canvasChipY,
									idwChipX: chipRequest.idwChipX,
									defectsPerChip: batchResults[index]?.defects ?? [],
								}));
							})(),
						]);

						for (const chunkResult of chunkResults[0]) {
							fetchedDefectCount += chunkResult.defectsPerChip.length;
							console.log(
								"[perf][useMapDefectsInfo.updateCache] chip fetched",
								{
									chipXY: chunkResult.chipXY,
									defectCount: chunkResult.defectsPerChip.length,
								},
							);
							if (chunkResult.defectsPerChip.length === 0) {
								continue;
							}
							fetchedChips.push(chunkResult);
						}
					}

					for (const fetchedChip of fetchedChips) {
						// API応答はIDW座標系なのでCanvas座標系にに変換してからQuadTreeに追加
						const chipXOffset =
							chipMapInfo.pixelSizeX * (fetchedChip.idwChipX + idw.mapOrigin.x);
						const chipYOffset =
							chipMapInfo.pixelSizeY * fetchedChip.canvasChipY;
						for (const defect of fetchedChip.defectsPerChip) {
							// 一度に大量にpushすると RangeError(Maximum call stack size exceeded)が発生するので
							// forループで1個ずつ追加
							const x = defect.coordX * chipMapInfo.scaleX + chipXOffset;
							const y =
								chipMapInfo.pixelSizeY -
								defect.coordY * chipMapInfo.scaleY +
								chipYOffset;
							newQuadTree.insert({
								defectId: defect.defectId,
								defectClass: defect.defectClass,
								x,
								y,
							});
						}
					}
					console.log("[perf][useMapDefectsInfo.updateCache] completed", {
						requestedChipCount,
						fetchedDefectCount,
						concurrency: CHIP_FETCH_CONCURRENCY,
						isEmpty: newQuadTree.isEmpty(),
						durationMs: performance.now() - startedAt,
					});
					if (newQuadTree.isEmpty()) return;
					set(defectQuadTreeAtom, newQuadTree);
				} catch (error) {
					console.log("[perf][useMapDefectsInfo.updateCache] failed", {
						requestedChipCount,
						fetchedDefectCount,
						durationMs: performance.now() - startedAt,
					});
					const res = await extractApiErrorInfo(error);
					if (res.aborted) return;
					// タイムアウト時はエラーメッセージを通知用atomに設定
					if (res.timeout) {
						console.log("set timeout message");
						set(
							mapNotificationSetterAtom,
							"Defects is too large and has timed out. Please review the conditions.",
						);
					}
					console.error(
						"getChipDefectsInfo fetch fail.",
						res.status ?? "",
						res.message,
					);
				} finally {
					set(isFetchingDefectsAtom, false);
					controller.abort();
				}
			},
			[disabled],
		),
	);

	useEffect(() => {
		// データが格納されていれば再取得は不要
		if (
			disabled ||
			isFetchingDefects ||
			enableChipSet.size === 0 ||
			(defectQuadTree != null && !defectQuadTree.isEmpty())
		)
			return;

		// 範囲内のDefect取得+キャッシュ更新
		updateCache(enableChipSet, chipMapInfo);
	}, [
		disabled,
		enableChipSet,
		updateCache,
		chipMapInfo,
		defectQuadTree,
		isFetchingDefects,
	]);

	return { defectQuadTree };
};
