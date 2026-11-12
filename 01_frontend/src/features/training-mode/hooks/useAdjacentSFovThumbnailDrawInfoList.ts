import { Point } from "pixi.js";

import type { SFovThumbnailDrawInfo } from "~/features/integrated-viewer-map/hooks/useSFovThumbnailDrawInfo";

export interface UseAdjacentSFovThumbnailDrawInfoList {
	getAdjacentSFovThumbnailDrawInfoList: (
		selectedFov: SFovThumbnailDrawInfo,
		selectedFovListForTraining: SFovThumbnailDrawInfo[],
	) => SFovThumbnailDrawInfo[];
}

// 指定のサムネイルと繋がっている選択状態のサムネイルを取得する
const getAdjacentSFovThumbnailDrawInfoList = (
	selectedFov: SFovThumbnailDrawInfo,
	selectedFovListForTraining: SFovThumbnailDrawInfo[],
): SFovThumbnailDrawInfo[] => {
	// 選択状態のサムネイルがない もしくは 指定のサムネイルが選択状態でないならば、空のリストを返す
	if (
		selectedFovListForTraining.length === 0 ||
		!selectedFovListForTraining.some((e) => selectedFov.imageid === e.imageid)
	) {
		return [];
	}

	// 選択状態かつチェックしていないサムネイル
	// 指定のサムネイルは自明のため取り除く
	const selectedFovListForTrainingNotChecked =
		selectedFovListForTraining.filter((e) => selectedFov.imageid !== e.imageid);
	// 繋がっているかつ調査済みのサムネイル
	const adjacenSFovList: SFovThumbnailDrawInfo[] = [];
	// 繋がっているかつ調査中のサムネイル
	const checkingSFovList: SFovThumbnailDrawInfo[] = [selectedFov];

	// 選択中かつ未調査のサムネイルがある かつ 繋がっているかつ調査中のサムネイルがある間ループ
	// 選択中かつ未調査のサムネイルがない場合はこれ以上の調査は不要のため、調査中のサムネイルを調査済みにする(return参照)
	while (
		selectedFovListForTrainingNotChecked.length > 0 &&
		checkingSFovList.length > 0
	) {
		// 調査中のサムネイルを一つ取り出す
		const checkingSFov = checkingSFovList.pop();
		if (checkingSFov == null) break;
		// サムネイルの中心座標を取得
		const center = getCenter(checkingSFov);
		// 隣接しているサムネイルを取得
		const adjacentList = selectedFovListForTrainingNotChecked.filter((e) =>
			isAdjacent(getCenter(e), center, checkingSFov.width, checkingSFov.height),
		);
		// 取得したサムネイルはselectedFovListForTrainingNotCheckedから削除する
		if (adjacentList.length > 0) {
			for (const adjacent of adjacentList) {
				selectedFovListForTrainingNotChecked.splice(
					selectedFovListForTrainingNotChecked.findIndex(
						(e) => e.imageid === adjacent.imageid,
					),
					1,
				);
			}
		}
		// 取得結果を繋がっているかつ調査中のサムネイルに追加
		checkingSFovList.push(...adjacentList);
		// 調査したサムネイルを調査済みに追加
		adjacenSFovList.push(checkingSFov);
	}

	// 調査中のサムネイルを調査済みにして返す
	return [...adjacenSFovList, ...checkingSFovList];
};

const isAdjacent = (
	a: Point,
	b: Point,
	width: number,
	height: number,
): boolean => {
	// サムネイルはオフセット等でずれるため、多少枠を広げて判定する必要がある。
	// 画像サイズの25%をずれの許容上限とする
	const margin = 0.25;
	return (
		// 横に隣接
		(Math.abs(a.x - b.x) < width * (1 + margin) &&
			Math.abs(a.y - b.y) < height * margin) ||
		// 縦に隣接(X軸方向は画像サイズの半分だけずれているため、画像サイズの半分の25%をずれの許容上限とする)
		(Math.abs(a.x - b.x) < (width / 2) * (1 + margin) &&
			Math.abs(a.y - b.y) < height * (1 + margin))
	);
};

const getCenter = (fov: SFovThumbnailDrawInfo): Point => {
	return new Point(
		fov.mfovImagePoints.x + fov.width / 2,
		fov.mfovImagePoints.y + fov.height / 2,
	);
};

export const useAdjacentSFovThumbnailDrawInfoList =
	(): UseAdjacentSFovThumbnailDrawInfoList => {
		return { getAdjacentSFovThumbnailDrawInfoList };
	};
