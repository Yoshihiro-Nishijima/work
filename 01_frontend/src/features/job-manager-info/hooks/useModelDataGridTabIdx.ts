import { atom, useAtom } from "jotai";
import type { Dispatch, SetStateAction } from "react";

const D2D_TABIDX = 0;
const D2DB_TABIDX = 1;

// 選択中のタブ番号
const modelDataGridTabIdxAtom = atom(D2D_TABIDX);

interface UseModelDataGridTabIdx {
	modelDataGridTabIdx: number;
	setModelDataGridTabIdx: Dispatch<SetStateAction<number>>;
	trainingType: "D2D" | "D2DB";
}

const getTrainingType = (idx: number): "D2D" | "D2DB" => {
	switch (idx) {
		case D2D_TABIDX:
			return "D2D";
		case D2DB_TABIDX:
			return "D2DB";
		default:
			// 通常は発生しない不正値
			return "D2D";
	}
};

/**
 * ModelDataGridTab内のタブインデクス状態管理
 * @returns ModelDataGridTab内のタブインデクスの getter / Setter
 */
export const useModelDataGridTabIdx = (): UseModelDataGridTabIdx => {
	const [modelDataGridTabIdx, setModelDataGridTabIdx] = useAtom(
		modelDataGridTabIdxAtom,
	);
	const trainingType = getTrainingType(modelDataGridTabIdx);

	return {
		modelDataGridTabIdx,
		setModelDataGridTabIdx,
		trainingType,
	};
};
