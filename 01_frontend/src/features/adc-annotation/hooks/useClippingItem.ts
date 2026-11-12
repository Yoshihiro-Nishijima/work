import { atom, useAtom } from "jotai";
import { useCallback, useEffect } from "react";

import { useFixedSizeGridProp } from "~/features/defect-list/hooks/useFixedSizeGridProp";

import { type FixedImgDataType, getCategoryColor } from "../types";
import { useDatasetDefect } from "./useDatasetDefect";
import { useEditCategories } from "./useEditCategories";
import { useSelectedDefect } from "./useSelectedDefect";

const useClippingItemAtom = atom<FixedImgDataType[][]>([]);

export interface UseClippingItem {
	clippingItem: FixedImgDataType[][];
	getIdByLinearIndex: (linearIndex: number) => number;
	getLinearIndexById: (id: number) => number;
	getLastLinearIndex: () => number;
	getRowColFromLinearIndex: (
		linearIndex: number,
	) => { row: number; col: number } | null;
	computeLinearIndex: (
		data: FixedImgDataType[][],
		rowIndex: number,
		colIndex: number,
	) => number;
}

export const useClippingItem = (): UseClippingItem => {
	const { defectList } = useDatasetDefect();
	const [clippingItem, setClippingItem] = useAtom(useClippingItemAtom);

	const { selectedDefects, lastSelectedDefect } = useSelectedDefect();
	const { editingCategoriesMap } = useEditCategories();
	const { columnCount } = useFixedSizeGridProp();

	useEffect(() => {
		const row: FixedImgDataType[] = [];
		const rows: FixedImgDataType[][] = [];
		defectList.forEach((data, idx) => {
			row.push({
				id: data.datasetId,
				img: data.src,
				outline:
					data.datasetId === lastSelectedDefect
						? "4px solid black"
						: selectedDefects.includes(data.datasetId)
							? "2px dashed gray"
							: "none",
				imgbackgroundcolor: getCategoryColor(
					editingCategoriesMap.get(data.datasetId) ?? data.category,
				),
				linearIndex: idx,
			});
			if ((idx + 1) % columnCount === 0) {
				rows.push([...row]);
				row.length = 0;
			}
		});
		if (row.length !== 0) {
			rows.push([...row]);
		}
		setClippingItem(rows);
	}, [
		defectList,
		columnCount,
		setClippingItem,
		selectedDefects,
		editingCategoriesMap,
		lastSelectedDefect,
	]);

	const getIdByLinearIndex = useCallback(
		(linearIndex: number): number => {
			if (linearIndex < 0) return -1;
			let rest = linearIndex;
			for (const row of clippingItem) {
				if (rest < row.length) {
					return row[rest]?.id ?? -1;
				}
				rest -= row.length;
			}
			return -1;
		},
		[clippingItem],
	);

	const computeLinearIndex = (
		data: typeof clippingItem,
		rowIndex: number,
		colIndex: number,
	): number => {
		if (rowIndex < 0 || rowIndex >= data.length) return -1;
		if (colIndex < 0 || colIndex >= (data[rowIndex]?.length ?? 0)) return -1;

		let acc = 0;
		for (let r = 0; r < rowIndex; r++) acc += data[r]?.length ?? 0;
		return acc + colIndex;
	};

	const getRowColFromLinearIndex = useCallback(
		(linearIndex: number): { row: number; col: number } | null => {
			if (linearIndex < 0) return null;
			let rest = linearIndex;
			for (let row = 0; row < clippingItem.length; row++) {
				if (rest < clippingItem[row].length) {
					return { row, col: rest };
				}
				rest -= clippingItem[row].length;
			}
			return null;
		},
		[clippingItem],
	);

	// biome-ignore lint/correctness/useExhaustiveDependencies: computeLinearIndexは安定しているため依存配列に含めない
	const getLinearIndexById = useCallback(
		(id: number): number => {
			for (let row = 0; row < clippingItem.length; row++) {
				for (let col = 0; col < clippingItem[row].length; col++) {
					const cell = clippingItem[row][col];
					if (cell && cell.id === id) {
						return computeLinearIndex(clippingItem, row, col);
					}
				}
			}
			return -1;
		},
		[clippingItem],
	);

	// biome-ignore lint/correctness/useExhaustiveDependencies: computeLinearIndexは安定しているため依存配列に含めない
	const getLastLinearIndex = useCallback((): number => {
		for (let row = clippingItem.length - 1; row >= 0; row--) {
			for (let col = clippingItem[row].length - 1; col >= 0; col--) {
				const cell = clippingItem[row][col];
				if (cell) {
					return computeLinearIndex(clippingItem, row, col);
				}
			}
		}
		return -1;
	}, [clippingItem]);

	return {
		clippingItem,
		getIdByLinearIndex,
		getLinearIndexById,
		getLastLinearIndex,
		getRowColFromLinearIndex,
		computeLinearIndex,
	};
};
