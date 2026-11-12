import { atom, useAtom } from "jotai";
import { atomFamily, useAtomCallback, useResetAtom } from "jotai/utils";
import {
	type Dispatch,
	type SetStateAction,
	useCallback,
	useEffect,
} from "react";

import { getDefect } from "~/features/defect-list/api/getDefect";
import { useGetDefect } from "~/features/defect-list/hooks/useDefect";
import type { DefectRecord } from "~/features/defect-list/types";

import { selectedFovAtom } from "~/features/s-fov-list/hooks/useFovList";
import { resultNameAtom } from "./useResultName";

// Defectリストで選択中のDefect
export const selectedDefectAtom = atom<DefectRecord | undefined>(undefined);

const mapDefectSelector = atomFamily((defectId: number) =>
	atom(async (get) => {
		// 該当のDefectを取得して返す
		// フィルタにdefectId指定で取得
		const query = `filter=${encodeURIComponent(
			JSON.stringify({
				items: [
					{
						field: "defectId",
						operator: "=",
						value: defectId,
					},
				],
			}),
		)}`;
		const controller = new AbortController();
		return await getDefect(get(resultNameAtom), query, controller.signal)
			.then((res) => {
				if (res.total > 0) return res.defects[0];
				return undefined;
			})
			.catch((error) => {
				if (error.name !== "AbortError")
					console.error("getDefect fetch fail.", error);
				return undefined;
			});
	}),
);

interface UseSelectedDefect {
	selectedDefect: DefectRecord | undefined;
	setSelectedDefect: Dispatch<SetStateAction<DefectRecord | undefined>>;
}

export const useSelectedDefect = (): UseSelectedDefect => {
	const [selectedDefect, setSelectedDefect] = useAtom(selectedDefectAtom);
	const resetSelectedFov = useResetAtom(selectedFovAtom);

	useEffect(() => {
		// Defect選択状態の際は、sFOV選択状態を解除
		if (selectedDefect != null) resetSelectedFov();
	}, [selectedDefect, resetSelectedFov]);

	return { selectedDefect, setSelectedDefect };
};

interface UseSetSelectedDefect {
	setSelectedDefectById: (defectId: number) => Promise<void>;
}

// SelectedDefectのsetterカスタムフック
// TODO 選択中要素カスタムフック対応の際に名前等は整理する
export const useSetSelectedDefect = (): UseSetSelectedDefect => {
	const { getDefectById } = useGetDefect();
	const resetSelectedFov = useResetAtom(selectedFovAtom);

	// MapエリアからのDefect選択用
	const setSelectedDefectById = useAtomCallback(
		useCallback(
			async (get, set, defectId: number): Promise<void> => {
				const nowDefectId = get(selectedDefectAtom);
				if (nowDefectId != null && nowDefectId.defectId === defectId) {
					return;
				}
				// Defectリストに含まれていたらそれを選択中にする
				const newDefect = getDefectById(defectId);
				if (newDefect != null) {
					set(selectedDefectAtom, newDefect);
					resetSelectedFov();
					return;
				}
				// Defectリストに含まれていなかったらMap表示用としてAPIから取得
				const newMapDefectInfo = await get(mapDefectSelector(defectId));
				if (newMapDefectInfo != null) {
					set(selectedDefectAtom, newMapDefectInfo);
					resetSelectedFov();
					return;
				}
				set(selectedDefectAtom, undefined);
			},
			[getDefectById, resetSelectedFov],
		),
	);

	return { setSelectedDefectById };
};
