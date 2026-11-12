import { useAtom } from "jotai";
import { atomWithReset, useAtomCallback, useResetAtom } from "jotai/utils";
import { useCallback, useMemo } from "react";
import type { CategoryType, PutCategoriesByIdParam } from "../types";
import { useSelectedDefect } from "./useSelectedDefect";

// 編集中カテゴリ情報(K:Id,V:CategoryType)
const editingCategoriesAtom = atomWithReset<Map<number, CategoryType>>(
	new Map(),
);

export interface UseEditCategories {
	/** 編集中カテゴリ情報Map(K:Id,V:CategoryType) */
	editingCategoriesMap: Map<number, CategoryType>;
	/** 編集中カテゴリ情報List */
	editingCategoriesList: PutCategoriesByIdParam[];
	updateSelectedCategories: (category: CategoryType) => void;
	removeSelectedCategories: () => void;
	clearEditingCategories: () => void;
	hasEditingCategories: boolean;
}

export const useEditCategories = (): UseEditCategories => {
	const editingCategoriesMap = useAtom(editingCategoriesAtom)[0];
	const clearEditingCategories = useResetAtom(editingCategoriesAtom);
	const { selectedDefects } = useSelectedDefect();

	const editingCategoriesList: PutCategoriesByIdParam[] = useMemo(
		() =>
			Array.from(editingCategoriesMap.entries(), ([id, category]) => ({
				id,
				category,
			})),
		[editingCategoriesMap],
	);

	// 複数IDへカテゴリ設定 (既存IDは上書き、未登録は追加)
	const updateSelectedCategories = useAtomCallback(
		useCallback(
			(_get, set, category: CategoryType) => {
				if (!selectedDefects || selectedDefects.length === 0) return;
				set(editingCategoriesAtom, (prev) => {
					const next = new Map(prev);
					for (const id of selectedDefects) next.set(id, category);
					return next;
				});
			},
			[selectedDefects],
		),
	);

	const removeSelectedCategories = useAtomCallback(
		useCallback(
			(_get, set) => {
				if (!selectedDefects || selectedDefects.length === 0) return;
				set(editingCategoriesAtom, (prev) => {
					const next = new Map(prev);
					for (const id of selectedDefects) next.delete(id);
					return next;
				});
			},
			[selectedDefects],
		),
	);

	const hasEditingCategories = editingCategoriesMap.size > 0;

	return {
		editingCategoriesMap,
		editingCategoriesList,
		updateSelectedCategories,
		removeSelectedCategories,
		hasEditingCategories,
		clearEditingCategories,
	};
};
