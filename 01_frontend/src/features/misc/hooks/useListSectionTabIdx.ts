import { atom, useAtom } from "jotai";
import { type Dispatch, type SetStateAction, useEffect } from "react";

import { useFovList } from "~/features/s-fov-list/hooks/useFovList";
import { useSelectedDefect } from "./useSelectedDefect";

export const SFOV_LIST_TABIDX = 0;
export const DEFECT_LIST_TABIDX = 1;

// 選択中のタブ番号
const listSectionTabIdxAtom = atom(SFOV_LIST_TABIDX);

interface UseListSectionTabIdx {
	listSectionTabIdx: number;
	setListSectionTabIdx: Dispatch<SetStateAction<number>>;
}
/**
 * 統合Viewer画面のリストタブのインデクス状態管理
 * をカスタムフックから操作するために使用
 * @returns リストタブのインデクスの getter / Setter
 */
export const useListSectionTabIdx = (): UseListSectionTabIdx => {
	const [listSectionTabIdx, setListSectionTabIdx] = useAtom(
		listSectionTabIdxAtom,
	);

	// TODO 「選択中要素」という状態を別に管理して個別に見なくても良いようにする
	const { selectedFov } = useFovList();
	const { selectedDefect } = useSelectedDefect();

	// TODO 本来は現状のインデクスと比較して変更時のみ処理させたい
	// 前述の「選択中要素」の対応時に解消予定
	useEffect(() => {
		if (selectedFov != null && selectedDefect == null) {
			setListSectionTabIdx(SFOV_LIST_TABIDX);
		} else if (selectedFov == null && selectedDefect != null) {
			setListSectionTabIdx(DEFECT_LIST_TABIDX);
		}
	}, [selectedFov, selectedDefect, setListSectionTabIdx]);

	return { listSectionTabIdx, setListSectionTabIdx };
};
