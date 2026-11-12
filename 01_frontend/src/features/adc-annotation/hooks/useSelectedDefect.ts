import { useAtom } from "jotai";
import { atomWithReset, useAtomCallback, useResetAtom } from "jotai/utils";
import { useCallback, useMemo } from "react";

// 選択中欠陥IDの集合
const selectedDefectsAtom = atomWithReset<number[]>([]);

export interface UseSelectedDefect {
	selectedDefects: number[];
	lastSelectedDefect?: number;
	addSelection: (ids: number[]) => void;
	removeSelection: (ids: number[]) => void;
	clearSelection: () => void;
	selectOnly: (id: number) => void;
	isSelected: (id: number) => boolean;
}

export const useSelectedDefect = (): UseSelectedDefect => {
	const [selectedDefects, setSelectedDefects] = useAtom(selectedDefectsAtom);
	const clearSelection = useResetAtom(selectedDefectsAtom);

	const lastSelectedDefect = useMemo(
		() => selectedDefects.at(-1),
		[selectedDefects],
	);

	const addSelection = useAtomCallback(
		useCallback((get, set, ids: number[]) => {
			if (!ids.length) return;
			const current = get(selectedDefectsAtom);
			const mergedSet = new Set(current);
			for (const id of ids) mergedSet.add(id);
			const merged = Array.from(mergedSet);
			set(selectedDefectsAtom, merged);
		}, []),
	);

	const removeSelection = useAtomCallback(
		useCallback((get, set, ids: number[]) => {
			if (!ids.length) return;
			const current = get(selectedDefectsAtom);
			const removeSet = new Set(ids);
			const filtered = current.filter((id) => !removeSet.has(id));
			set(selectedDefectsAtom, filtered);
		}, []),
	);

	const selectOnly = useCallback(
		(id: number) => {
			setSelectedDefects([id]);
		},
		[setSelectedDefects],
	);

	const isSelected = useCallback(
		(id: number): boolean => {
			return selectedDefects.includes(id);
		},
		[selectedDefects],
	);

	return {
		selectedDefects,
		lastSelectedDefect,
		addSelection,
		removeSelection,
		clearSelection,
		selectOnly,
		isSelected,
	};
};
