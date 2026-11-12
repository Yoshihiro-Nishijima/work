import { atom, useAtom } from "jotai";
import type { Dispatch, SetStateAction } from "react";

// 表示中のDefectリストモード
const defectListViewAtom = atom<"list" | "thumbnailList" | "thumbnail">("list");

interface UseDefectListView {
	defectListView: "list" | "thumbnailList" | "thumbnail";
	setDefectListView: Dispatch<
		SetStateAction<"list" | "thumbnailList" | "thumbnail">
	>;
}

export const useDefectListView = (): UseDefectListView => {
	const [defectListView, setDefectListView] = useAtom(defectListViewAtom);

	return { defectListView, setDefectListView };
};
