import { Point } from "pixi.js";
import {
	type Dispatch,
	type SetStateAction,
	useCallback,
	useEffect,
	useMemo,
	useState,
} from "react";

import type { Filter } from "~/features/job-manager-info/types";
import { useIdw } from "~/features/map/hooks";
import { useResultName } from "~/features/misc/hooks/useResultName";
import { toPagingQueryParam } from "~/features/misc/types/pagingQueryParam";
import type { Fov } from "~/features/s-fov-list/types";

import { atom, useAtom, useAtomValue } from "jotai";
import { getFov } from "~/features/s-fov-list/api/getFov";
import { useChipMapInfo } from "./useChipMapInfo";
import {
	type MFovDrawInfo,
	isSFovThumbnailDisplayLevel,
	useMapDisplay,
	useMapInfo,
} from "./useMapInfo";
import { chipMFovsAtom } from "./useMapMFovs";

const sFovListOfDisplayedMFovAtAllTimeAtom = atom<Fov[]>([]);

interface FilterItems {
	field: string;
	operator: string;
	value: number;
}

interface UseSFovListOfDisplayedMFovAtAllTime {
	// 表示対象mFOV内sFOVList(すでに表示済みの表示対象mFOV)
	sFovListOfDisplayedMFovAtAllTime: Fov[];
}

interface UseMapSFovs {
	// 表示対象mFOV内sFOVList(その時点での表示対象mFOV)
	sFovListOfDisplayedMFovAtThatMoment: Fov[];
	// 表示対象mFOV noリスト
	drawMFovNos: number[];
	// 表示対象mFOV noリスト(通常は使用しない. 単体テストのためだけに使用)
	setDrawMFovNos: Dispatch<SetStateAction<number[]>>;
	// 表示対象mFOV内sFOVList(すでに表示済みの表示対象mFOV)
	sFovListOfDisplayedMFovAtAllTime: Fov[];
}

export const useSFovListOfDisplayedMFovAtAllTime =
	(): UseSFovListOfDisplayedMFovAtAllTime => {
		// 表示対象のsFOVリストを格納(既表示済みのものを含む)
		const sFovListOfDisplayedMFovAtAllTime = useAtomValue(
			sFovListOfDisplayedMFovAtAllTimeAtom,
		);
		return { sFovListOfDisplayedMFovAtAllTime };
	};

export const useMapSFovs = (): UseMapSFovs => {
	const [
		sFovListOfDisplayedMFovAtThatMoment,
		setSFovListOfDisplayedMFovAtThatMoment,
	] = useState<Fov[]>([]);
	const [drawMFovNos, setDrawMFovNos] = useState<number[]>([]);
	const { chipMapInfo } = useChipMapInfo();
	const { displayViewArea, updateDrawMFovPointInfos } = useMapInfo();
	const disableSFovThumbnail = !isSFovThumbnailDisplayLevel();
	const { displayCenterPoint } = useMapDisplay();
	const {
		toDrawChipIndex,
		toIdwChipIndex,
		calcDrawChipIndex,
		toDrawChipPoint,
		getMFovPixSize,
	} = useIdw();
	const chipMFovs = useAtomValue(chipMFovsAtom);
	const { resultName } = useResultName();
	// 画面描画中のmfovnoを管理
	const [alreadyDrawnMFovNos, setAlreadyDrawnMFovNos] = useState<number[]>([]);
	// SFovサムネイルの表示対象Chipindexを管理
	const [drawSFovThumbnailChipIndexList, setDrawSFovThumbnailChipIndexList] =
		useState<Point[]>([]);
	// 表示対象のsFOVリストを格納(既表示済みのものを含む)
	const [
		sFovListOfDisplayedMFovAtAllTime,
		setSFovListOfDisplayedMFovAtAllTime,
	] = useAtom(sFovListOfDisplayedMFovAtAllTimeAtom);

	/**
	 * 表示用sFOVリストを更新 \
	 * 既存sFOVと比較して、サイズ違いまたは sFovNo/mFovNoが不一致の要素があれば更新
	 *
	 * @param newFovs 新規表示用 sFOVリスト
	 */
	const updateSFovListOfDisplayedMFovAtThatMoment: (newFovs: Fov[]) => void =
		useCallback(
			(newFovs: Fov[]) => {
				//
				if (
					newFovs.length !== sFovListOfDisplayedMFovAtThatMoment.length ||
					newFovs.some(
						(newFov) =>
							!sFovListOfDisplayedMFovAtThatMoment.some(
								(prevFov) =>
									prevFov.mfovno === newFov.mfovno &&
									prevFov.sfovno === newFov.sfovno,
							),
					)
				) {
					setSFovListOfDisplayedMFovAtThatMoment(newFovs);
					// 表示用sFOVリストは既表示済みのものも含めて管理するので更新ではなく追加
					setSFovListOfDisplayedMFovAtAllTime((prev) => prev.concat(newFovs));
				}
			},
			[
				sFovListOfDisplayedMFovAtThatMoment,
				setSFovListOfDisplayedMFovAtAllTime,
			],
		);

	// SFovサムネイルの表示対象Chipindex取得
	useEffect(() => {
		if (disableSFovThumbnail) {
			// sFovサムネイル 非表示処理
			// NOTE: mFovDrawInfoForSFovMapはクリアしない（一度取得した座標情報は保持する）
			setDrawSFovThumbnailChipIndexList([]);
			return;
		}

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
		const drawIdwChipIndexList = [];
		for (let x = start.x; x <= end.x; x++) {
			for (let y = start.y; y <= end.y; y++) {
				drawIdwChipIndexList.push(toIdwChipIndex(new Point(x, y)));
			}
		}
		setDrawSFovThumbnailChipIndexList(drawIdwChipIndexList);
	}, [
		chipMapInfo.pixelSizeX,
		chipMapInfo.pixelSizeY,
		displayViewArea,
		disableSFovThumbnail,
		calcDrawChipIndex,
		toIdwChipIndex,
	]);

	// 表示対象Chipの mFovリスト
	const mapMFovsForUpdate = chipMFovs.filter((m) =>
		drawSFovThumbnailChipIndexList.some((chipIdx) =>
			chipIdx.equals(m.chipIndex),
		),
	);
	// mFov描画情報リスト更新処理のuseEffectの呼び出しを抑えるために前提条件式を依存値として扱う
	const enableMfovUpdate =
		!disableSFovThumbnail &&
		drawSFovThumbnailChipIndexList.length > 0 &&
		mapMFovsForUpdate.length > 0 &&
		displayCenterPoint.x !== 0 &&
		displayCenterPoint.y !== 0;

	const displayWidth =
		displayViewArea.rightBottomPoint.x - displayViewArea.leftTopPoint.x;
	const displayHeight =
		displayViewArea.rightBottomPoint.y - displayViewArea.leftTopPoint.y;

	// mFovMap表示用 mFOV描画情報リスト更新
	useEffect(() => {
		if (!enableMfovUpdate) return;
		const newMFovNosList: number[] = [];
		// 更新
		const newDrawMFovPointInfos = new Map<number, MFovDrawInfo>();
		// 対象mfov取得
		for (const mapMfov of mapMFovsForUpdate) {
			// Idw上Chip座標を描画用Chip座標に変換
			const drawChipIndex = toDrawChipIndex(mapMfov.chipIndex);
			// チップ原点座標を求める
			const chipOriginPoint = new Point(
				drawChipIndex.x * chipMapInfo.pixelSizeX,
				drawChipIndex.y * chipMapInfo.pixelSizeY,
			);
			for (const mfov of mapMfov.mFovList) {
				// Chip内の座標を取得
				const mfovDrawChipPoint = toDrawChipPoint(
					chipMapInfo.pixelSizeX,
					chipMapInfo.pixelSizeY,
					new Point(mfov.mfovX, mfov.mfovY),
				);
				// Chip内座標を使用して、World座標計算
				const mfovWorldPoint = new Point(
					chipOriginPoint.x + mfovDrawChipPoint.x,
					chipOriginPoint.y + chipMapInfo.pixelSizeY - mfovDrawChipPoint.y,
				);
				const mfovWorldSize = getMFovPixSize(
					mfov.areaNo,
					new Point(chipMapInfo.pixelSizeX, chipMapInfo.pixelSizeY),
				);

				// ①x方向距離 = (表示領域の中心座標X - mfovの中心座標X)の絶対値
				const xDistance = Math.abs(displayCenterPoint.x - mfovWorldPoint.x);
				// ②ふたつの幅 ÷ 2 を 足す
				const xWidth = displayWidth / 2 + mfovWorldSize.x / 2;
				// ①y方向距離 = (表示領域の中心座標X - mfovの中心座標X)の絶対値
				const yDistance = Math.abs(displayCenterPoint.y - mfovWorldPoint.y);
				// ②ふたつの高さ ÷ 2 を 足す 表示領域.width /2 + Hex収まる四角.width/2
				const yHeight = displayHeight / 2 + mfovWorldSize.y / 2;
				// ① < ② の場合、当たり判定 OK
				if (xDistance < xWidth && yDistance < yHeight) {
					// 登録済みmfovはスキップ
					if (
						alreadyDrawnMFovNos.includes(mfov.mfovNo) ||
						newMFovNosList.includes(mfov.mfovNo)
					) {
						continue;
					}

					newMFovNosList.push(mfov.mfovNo);
					newDrawMFovPointInfos.set(mfov.mfovNo, {
						mfovX: mfov.mfovX,
						mfovY: mfov.mfovY,
						areaNo: mfov.areaNo,
					});
				}
			}
		}
		if (newDrawMFovPointInfos.size !== 0) {
			updateDrawMFovPointInfos(newDrawMFovPointInfos);
			setDrawMFovNos(newMFovNosList);
			setAlreadyDrawnMFovNos((alreadyDrawnMFovNos) =>
				alreadyDrawnMFovNos.concat(newMFovNosList),
			);
		}
	}, [
		chipMapInfo.pixelSizeX,
		chipMapInfo.pixelSizeY,
		toDrawChipIndex,
		toDrawChipPoint,
		displayCenterPoint,
		displayWidth,
		displayHeight,
		mapMFovsForUpdate,
		getMFovPixSize,
		updateDrawMFovPointInfos,
		alreadyDrawnMFovNos,
		enableMfovUpdate,
	]);

	// mFovMap表示用 sFOVリスト取得用クエリ文字列作成
	const createSFovQueryStr = useCallback((mfovnos: number[]): string => {
		if (mfovnos.length === 0) return "";
		const filterItems: FilterItems[] = mfovnos.map((value) => {
			return {
				field: "mfovno",
				operator: "=",
				value,
			};
		});
		return toPagingQueryParam(undefined, [], {
			items: filterItems,
			logicOperator: "or",
		} satisfies Filter);
	}, []);

	const disableQuery =
		disableSFovThumbnail || resultName.length === 0 || drawMFovNos.length === 0;

	const query = useMemo(() => {
		if (disableQuery) return "";
		return createSFovQueryStr(drawMFovNos);
	}, [disableQuery, createSFovQueryStr, drawMFovNos]);

	// biome-ignore lint/correctness/useExhaustiveDependencies: 更新関数は検索したときにだけ使用するので常時監視する必要はない
	useEffect(() => {
		if (disableQuery) return;
		const controller = new AbortController();
		getFov(resultName, query, controller.signal)
			.then((res) => {
				if (res?.total > 0) updateSFovListOfDisplayedMFovAtThatMoment(res.fovs);
			})
			.catch((error) => {
				if (error.name === "AbortError") return;
				console.error("getFov fetch fail.", error);
			});
		return () => {
			controller.abort();
		};
	}, [disableQuery, query]);

	return {
		sFovListOfDisplayedMFovAtThatMoment,
		drawMFovNos,
		setDrawMFovNos,
		sFovListOfDisplayedMFovAtAllTime,
	};
};
