import { useAtomValue } from "jotai";
import { Point } from "pixi.js";
import { useCallback, useEffect, useState } from "react";

import { useIdw, useSFovs } from "~/features/map/hooks";
import { useResultName } from "~/features/misc/hooks/useResultName";
import { selectedSFovImageIdSetReadAtom } from "~/features/misc/hooks/useSelectedSFovImageIdList";
import { getPickedFovImageIdListAtom } from "~/features/s-fov-list/hooks/usePickedFov";
import type { Fov } from "~/features/s-fov-list/types";

import { useFovList } from "~/features/s-fov-list/hooks/useFovList";
import { useChipMapInfo } from "./useChipMapInfo";
import { useMapInfo } from "./useMapInfo";
import { useMapSFovs } from "./useMapSFovs";

// mFovの生成数, サイズ および mFovを描画するChip座標を管理(mFOVでまとまったsFOVデータを追加しリスト管理)
export interface SFovThumbnailDrawInfo {
	imageid: number;
	mfovno: number;
	sfovno: number;
	indexX: number;
	indexY: number;
	mfovImagePoints: Point;
	imageUrl: string;
	spriteSheetUrl: string;
	isSelected: boolean;
	width: number;
	height: number;
}

interface DrawSelectedSFovInfo {
	point: Point;
	width: number;
	height: number;
}

interface UseSFovThumbnailDrawInfo {
	sFovThumbnailDrawInfos: SFovThumbnailDrawInfo[];
	// 統合ビューア(標準Mode)sFov単数選択用
	getSelectedSFovDrawInfo: () => DrawSelectedSFovInfo | undefined;
	// 統合ビューア(TrainingMode)sFov複数選択用
	getSelectedSFovDrawInfoList: () => DrawSelectedSFovInfo[] | undefined;
	selectedMFovImageListForTraining: SFovThumbnailDrawInfo[];
}

export const useSFovThumbnailDrawInfo = (): UseSFovThumbnailDrawInfo => {
	// サムネイル画像描画用データ
	const [sFovThumbnailDrawInfos, setSFovThumbnailDrawInfos] = useState<
		SFovThumbnailDrawInfo[]
	>([]);
	const { selectedFov } = useFovList();
	const {
		sFovListOfDisplayedMFovAtThatMoment,
		sFovListOfDisplayedMFovAtAllTime,
		drawMFovNos,
	} = useMapSFovs();
	const { sFovList } = useSFovs();
	const { toolData } = useResultName();

	const { toDrawChipIndex, toDrawChipPoint, idw, getSFovPixSize } = useIdw();
	const { chipMapInfo } = useChipMapInfo();
	const { mFovDrawInfoForSFovMap } = useMapInfo();
	const selectedImageIdSet = useAtomValue(selectedSFovImageIdSetReadAtom);
	const pickedImageIdList = useAtomValue(getPickedFovImageIdListAtom);
	const hasPickedImageIds = pickedImageIdList.length !== 0;
	const [pickedOffSFovDrawInfos, setPickedOffSFovDrawInfos] = useState<
		SFovThumbnailDrawInfo[]
	>([]);
	const [isPickedDraw, setIsPickedDraw] = useState(false);

	const pixelSizePoint = new Point(
		chipMapInfo.pixelSizeX,
		chipMapInfo.pixelSizeY,
	);

	/** mfovのWorld座標を求める */
	const getMFovWorldPoint = useCallback(
		(sfov: Fov): Point => {
			const mfovPointInfo = mFovDrawInfoForSFovMap.get(sfov.mfovno);
			if (mfovPointInfo == null) return new Point();
			if (idw == null) return new Point();
			// Idw上Chip座標を描画用Chip座標に変換
			const drawChipIndex = toDrawChipIndex(
				new Point(sfov.indexX, sfov.indexY),
			);
			// チップ原点座標を求める
			const chipOriginPoint = new Point(
				drawChipIndex.x * chipMapInfo.pixelSizeX,
				drawChipIndex.y * chipMapInfo.pixelSizeY,
			);
			// mfovのchip内座標を取得
			const mfovDrawChipPoint = toDrawChipPoint(
				chipMapInfo.pixelSizeX,
				chipMapInfo.pixelSizeY,
				new Point(mfovPointInfo.mfovX, mfovPointInfo.mfovY),
			);
			// mfovWorld座標を計算
			const mfovWorldPoint = new Point(
				chipOriginPoint.x + mfovDrawChipPoint.x,
				chipOriginPoint.y + chipMapInfo.pixelSizeY - mfovDrawChipPoint.y,
			);
			return mfovWorldPoint;
		},
		[
			chipMapInfo.pixelSizeX,
			chipMapInfo.pixelSizeY,
			toDrawChipIndex,
			toDrawChipPoint,
			idw,
			mFovDrawInfoForSFovMap,
		],
	);

	/** offset位置のworld座標変換処理 */
	const getWorldOffset = useCallback(
		(sfov: Fov): Point => {
			if (idw == null || sFovList == null) return new Point();

			const offset = sFovList[sfov.sfovno - 1];

			// offset位置をworld座標に変換
			return toDrawChipPoint(
				chipMapInfo.pixelSizeX,
				chipMapInfo.pixelSizeY,
				new Point(offset.x, offset.y),
			);
		},
		[
			chipMapInfo.pixelSizeX,
			chipMapInfo.pixelSizeY,
			toDrawChipPoint,
			idw,
			sFovList,
		],
	);

	/** SFovサムネイル画像を配置するWorld座標取得 */
	const getSFovThubmnailPlacementWorldPoint = useCallback(
		(sfov: Fov, mfovWorldPoint: Point, worldOffset: Point): Point => {
			const imageSize = getSFovPixSize(
				sfov.areano,
				new Point(chipMapInfo.pixelSizeX, chipMapInfo.pixelSizeY),
			);
			const imagePointX = mfovWorldPoint.x + worldOffset.x - imageSize.x / 2;
			const imagePointY = mfovWorldPoint.y - worldOffset.y - imageSize.y / 2;
			return new Point(imagePointX, imagePointY);
		},
		[chipMapInfo.pixelSizeX, chipMapInfo.pixelSizeY, getSFovPixSize],
	);

	/**	  SFovThumbnailDrawInfo生成	 */
	const makeSFovThumbnailDrawInfo = useCallback(
		(sfov: Fov): SFovThumbnailDrawInfo => {
			// mfovWorld座標を取得
			const mfovWorldPoint = getMFovWorldPoint(sfov);

			// offset位置をworld座標に変換
			const worldOffset = getWorldOffset(sfov);
			const { x: width, y: height } = getSFovPixSize(
				sfov.areano,
				pixelSizePoint,
			);
			const mfovImagePoints = getSFovThubmnailPlacementWorldPoint(
				sfov,
				mfovWorldPoint,
				worldOffset,
			);

			// スプライトシート方式: mFOVごとに1つのスプライトシートを使用
			const spriteSheetUrl = `/tool-data/${toolData}/${sfov.mfovno}-sprite.png`;
			const imageUrl = `/tool-data/${toolData}/${sfov.mfovno}-${sfov.sfovno}-sem.png`;

			const isSelected = selectedFov?.imageid === sfov.imageid;
			return {
				imageid: sfov.imageid,
				mfovno: sfov.mfovno,
				sfovno: sfov.sfovno,
				indexX: sfov.indexX,
				indexY: sfov.indexY,
				mfovImagePoints,
				// フォールバック用に個別画像URLも保持
				imageUrl,
				spriteSheetUrl,
				isSelected,
				width,
				height,
			};
		},
		[
			getMFovWorldPoint,
			getWorldOffset,
			getSFovPixSize,
			getSFovThubmnailPlacementWorldPoint,
			pixelSizePoint,
			toolData,
			selectedFov,
		],
	);

	useEffect(() => {
		/**
		 * 描画対象mFovに含まれるsFovサムネイル画像情報リストを取得
		 */
		if (
			idw == null ||
			toolData == null ||
			sFovListOfDisplayedMFovAtThatMoment.length === 0 ||
			drawMFovNos.length === 0
		) {
			return;
		}

		if (!hasPickedImageIds && isPickedDraw) {
			// Picked ON→OFFで呼ばれた場合は別の箇所契機の再描画のためSkip
			setIsPickedDraw(false);
			return;
		}
		const sFovDrawInfoList: SFovThumbnailDrawInfo[] = [];
		// 描画済みmFovNoリスト(重複を除外するため一旦Setに格納)
		const oldMFovNosList = Array.from(
			new Set(sFovThumbnailDrawInfos.map((obj) => obj.mfovno)),
		);
		for (const sfov of sFovListOfDisplayedMFovAtThatMoment) {
			// 描画済みmFovのsFovはSkip
			if (oldMFovNosList.includes(sfov.mfovno)) continue;

			// 描画対象mFovNo以外のsFovはSkip
			if (!drawMFovNos.includes(sfov.mfovno)) continue;

			// Picked ONの際は登録済みのsFOVは登録Skip
			if (
				hasPickedImageIds &&
				pickedOffSFovDrawInfos.some((v) => v.imageid === sfov.imageid)
			) {
				continue;
			}
			// sFovサムネイル画像情報追加
			sFovDrawInfoList.push(makeSFovThumbnailDrawInfo(sfov));
		}
		if (sFovDrawInfoList.length === 0) return;

		// 追加表示されたmFOV内のsFOVを描画対象として登録
		if (hasPickedImageIds) {
			// Picked時
			// Picked描画用
			const pickedSFovDrawInfos = sFovDrawInfoList.filter((fov) =>
				pickedImageIdList.includes(fov.imageid),
			);
			setSFovThumbnailDrawInfos((prev) => prev.concat(pickedSFovDrawInfos));
			// Picked解除後描画用
			setPickedOffSFovDrawInfos((prev) => prev.concat(sFovDrawInfoList));
		} else {
			// 通常時(Picked未設定)
			setSFovThumbnailDrawInfos((prev) => prev.concat(sFovDrawInfoList));
		}
	}, [
		idw,
		sFovListOfDisplayedMFovAtThatMoment,
		sFovThumbnailDrawInfos,
		toolData,
		drawMFovNos,
		hasPickedImageIds,
		pickedImageIdList,
		pickedOffSFovDrawInfos,
		isPickedDraw,
		makeSFovThumbnailDrawInfo,
	]);

	// biome-ignore lint/correctness/useExhaustiveDependencies: pickedFovListのみ監視(他のパラメータは更新対象でもあるため、呼んだ場合ループしないように判定が必要）
	useEffect(() => {
		/** Picked ON/OFF時の表示sFOV管理 */
		if (hasPickedImageIds && pickedOffSFovDrawInfos.length === 0) {
			// PickedボタンのOFF→ON契機
			setPickedOffSFovDrawInfos(sFovThumbnailDrawInfos);
			setSFovThumbnailDrawInfos(
				sFovThumbnailDrawInfos.filter((sFovThumbnailDrawInfo) =>
					pickedImageIdList.includes(sFovThumbnailDrawInfo.imageid),
				),
			);
			setIsPickedDraw(true);
		} else if (!hasPickedImageIds && pickedOffSFovDrawInfos.length !== 0) {
			// PickedボタンのON→OFF契機
			setSFovThumbnailDrawInfos(pickedOffSFovDrawInfos);
			setPickedOffSFovDrawInfos([]);
		}
	}, [pickedImageIdList]);

	const getSelectedSFovDrawInfo = useCallback(():
		| DrawSelectedSFovInfo
		| undefined => {
		if (idw == null || selectedFov == null) return undefined;
		const mfovWorldPoint = getMFovWorldPoint(selectedFov);
		const worldOffset = getWorldOffset(selectedFov);

		const imageSize = getSFovPixSize(
			selectedFov.areano,
			new Point(chipMapInfo.pixelSizeX, chipMapInfo.pixelSizeY),
		);

		const imagePoint = getSFovThubmnailPlacementWorldPoint(
			selectedFov,
			mfovWorldPoint,
			worldOffset,
		);
		const selectedSFovDrawInfo = {
			point: imagePoint,
			width: imageSize.x,
			height: imageSize.y,
		};
		return selectedSFovDrawInfo;
	}, [
		selectedFov,
		chipMapInfo.pixelSizeX,
		chipMapInfo.pixelSizeY,
		getSFovPixSize,
		getMFovWorldPoint,
		getWorldOffset,
		getSFovThubmnailPlacementWorldPoint,
		idw,
	]);

	const getSelectedSFovDrawInfoList =
		useCallback((): DrawSelectedSFovInfo[] => {
			// Picked時の表示サムネイルフィルタ
			const drawsFovList = hasPickedImageIds
				? sFovListOfDisplayedMFovAtAllTime.filter((e) =>
						pickedImageIdList.includes(e.imageid),
					)
				: sFovListOfDisplayedMFovAtAllTime;

			return drawsFovList
				.filter((e) => selectedImageIdSet.has(e.imageid))
				.map((e) => {
					const mfovWorldPoint = getMFovWorldPoint(e);
					const worldOffset = getWorldOffset(e);

					const imageSize = getSFovPixSize(
						e.areano,
						new Point(chipMapInfo.pixelSizeX, chipMapInfo.pixelSizeY),
					);

					const imagePoint = getSFovThubmnailPlacementWorldPoint(
						e,
						mfovWorldPoint,
						worldOffset,
					);
					return {
						point: imagePoint,
						width: imageSize.x,
						height: imageSize.y,
					} satisfies DrawSelectedSFovInfo;
				});
		}, [
			hasPickedImageIds,
			pickedImageIdList,
			selectedImageIdSet,
			chipMapInfo.pixelSizeX,
			chipMapInfo.pixelSizeY,
			getSFovPixSize,
			getMFovWorldPoint,
			getWorldOffset,
			getSFovThubmnailPlacementWorldPoint,
			sFovListOfDisplayedMFovAtAllTime,
		]);

	const selectedMFovImageListForTraining = sFovThumbnailDrawInfos.filter(
		(fov) => selectedImageIdSet.has(fov.imageid),
	);

	return {
		sFovThumbnailDrawInfos,
		getSelectedSFovDrawInfo,
		getSelectedSFovDrawInfoList,
		selectedMFovImageListForTraining,
	};
};
