import { atom, useSetAtom } from "jotai";

import { getFov } from "~/features/s-fov-list/api/getFov";
import { fovListAtom } from "~/features/s-fov-list/hooks/useFovList";
import type { Fov } from "~/features/s-fov-list/types";
import { resultNameAtom } from "./useResultName";

// 選択中sFOVリスト
const selectedSFovListAtom = atom<Fov[]>([]);

interface UseSelectedSFovImageIdList {
	// 選択中sFOVリスト追加
	add: (addFovList: Fov[]) => void;
	// 選択中sFOVリスト追加(ImageId指定)
	addById: (imageIdList: number[]) => void;
	// 選択中sFOVリスト全選択(追加) ※対象は画面表示範囲のみ(フィルターで見えないものは除外)
	addAll: () => void;
	// 選択中sFOVリスト削除
	remove: (removeImageIdList: number[]) => void;
	// 選択中sFOVリスト全解除(削除) ※対象は画面表示範囲のみ(フィルターで見えないものは除外)
	removeAll: () => void;
	// 指定のsFovの選択状態を変更
	toggle: (toggleImageIdList: number) => void;
}

export const selectedSFovListReadAtom = atom((get) =>
	get(selectedSFovListAtom),
);

// 選択中sFOV ImageIdセット取得(呼び出し側でこのAtomを取得して、選択中sFOVの状態変化を検知)
export const selectedSFovImageIdSetReadAtom = atom((get) => {
	return new Set(get(selectedSFovListAtom).map((fov) => fov.imageid));
});

// 選択中sFOVリスト追加用Write-Atom(Fov指定)
const addAtom = atom(undefined, (get, set, addFovList: Fov[]) => {
	set(selectedSFovListAtom, (prev) => {
		const selectedIdList = get(selectedSFovListAtom).map((fov) => fov.imageid);
		const newFovList = addFovList.filter(
			(fov) => !selectedIdList.includes(fov.imageid),
		);
		return [...prev, ...newFovList];
	});
});

// 選択中sFOVリスト追加用Write-Atom(imageId指定)
const addByIdAtom = atom([], async (get, set, addImageIdList: number[]) => {
	// 指定された追加imageIdリストから選択中のidを除外したSetを作成
	const selectedIdList = get(selectedSFovListAtom).map((fov) => fov.imageid);
	const addImageIdSet = new Set(
		addImageIdList.filter((id) => !selectedIdList.includes(id)),
	);
	if (addImageIdSet.size === 0) return;

	const addFovList: Fov[] = [];
	for (const fov of get(fovListAtom)) {
		// fovListから 追加imageIdに該当するsFOVを取得してセット
		if (addImageIdSet.has(fov.imageid)) {
			addImageIdSet.delete(fov.imageid);
			addFovList.push(fov);
		}
	}
	if (addImageIdSet.size > 0) {
		// fovListから取得できなかった分は APIから取得
		const query = `filter=${encodeURIComponent(
			JSON.stringify({
				items: [
					{
						field: "imageid",
						operator: "isAnyOf",
						value: [...addImageIdSet],
					},
				],
			}),
		)}`;
		const resultName = get(resultNameAtom);
		const controller = new AbortController();
		await getFov(resultName, query, controller.signal)
			.then((res) => {
				if (res.total === 0) return;
				addFovList.push(...res.fovs);
			})
			.catch((error) => {
				if (error.name !== "AbortError") {
					console.error("getFov fetch fail.", error);
				}
			});
	}
	set(selectedSFovListAtom, (prev) => [...prev, ...addFovList]);
});

// 取得済みsFOVリスト全てを選択中sFOVリストに追加するWrite-Atom
const addAllAtom = atom(undefined, (get, set) => {
	set(addAtom, get(fovListAtom));
});

// 選択中sFOVリスト削除用Write-Atom(指定されたimageIdをキーにリストから削除)
const removeAtom = atom(undefined, (_, set, removeImageIdList: number[]) => {
	set(selectedSFovListAtom, (prev) =>
		prev.filter((fov) => !removeImageIdList.includes(fov.imageid)),
	);
});

// 取得済みsFOVリスト全てを選択中sFOVリストから削除するWrite-Atom
const removeAllAtom = atom(undefined, (get, set) => {
	set(
		removeAtom,
		get(fovListAtom).map((fov) => fov.imageid),
	);
});

// 指定のsFOVの選択状態を変更(MapエリアのsFOVサムネイルクリック時)
const toggleAtom = atom(undefined, (get, set, toggleImageId: number) => {
	const selectedIdList = get(selectedSFovListAtom).map((fov) => fov.imageid);
	// 選択中の場合
	if (selectedIdList.includes(toggleImageId)) {
		set(removeAtom, [toggleImageId]);
		return;
	}
	// 未選択の場合
	set(addByIdAtom, [toggleImageId]);
});

export const useSelectedSFovImageIdList = (): UseSelectedSFovImageIdList => {
	// 選択中sFOV追加
	const add = useSetAtom(addAtom);

	// 選択中sFOV追加(imageId指定)
	const addById = useSetAtom(addByIdAtom);

	// 全選択処理(sFovリスト全て)
	const addAll = useSetAtom(addAllAtom);

	// 選択中sFOVリスト削除
	const remove = useSetAtom(removeAtom);

	// 全解除処理(画面に表示中(Fileterされているものは除外）のsFovをリストから全削除。
	//  ここではリスト全部を指定し、removeの際に存在しないものはスキップ。)
	const removeAll = useSetAtom(removeAllAtom);

	// 指定のimageIdの選択状態を変更
	const toggle = useSetAtom(toggleAtom);

	return {
		add,
		addById,
		addAll,
		remove,
		removeAll,
		toggle,
	};
};
