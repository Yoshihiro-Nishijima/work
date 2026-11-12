import { atom, useAtom, useAtomValue, useSetAtom } from "jotai";
import { useResetAtom } from "jotai/utils";
import { useCallback } from "react";

import { getRecipeModeParam } from "../api";
import type { RecipeBase } from "../types";
import { ommitString } from "../types/converter";

import { useSetADCParam } from "./useADCParam";
import { selectedAreaNoAtom } from "./useAreaNos";
import { useSetCorrectionParam } from "./useCorrectionParam";
import { useSetInspectionParam } from "./useInspectionParam";
import { useSetMatchingParam } from "./useMatchingParam";
import { useExecuteRecipeCommonParam } from "./useRecipeCommonParam";

// モードパラメータデフォルト値
const initModeBase: RecipeBase = {
	fileID: "",
	version: 1,
	revision: 1,
	comment: "",
};
// モードパラメータ共通項目(エリアNo共通)
const modeBaseAtom = atom(initModeBase);

// 編集中エリアNoリスト(ReExecute 対象)
export const editAreaNosAtom = atom<number[]>([]);
const editAreaNoResetAtom = atom(
	(get) => get(editAreaNosAtom),
	(_get, set) => {
		set(editAreaNosAtom, []);
	},
);

interface UseRecipeModeParam {
	modeBase: RecipeBase;
	editAreaNos: number[];
	resetEditAreaNos: () => void;
	setRecipeModeParam: () => void;
}
export const useRecipeModeParam = (): UseRecipeModeParam => {
	const modeBase = useAtomValue(modeBaseAtom);
	const { jobName } = useExecuteRecipeCommonParam();
	const selectedAreaNo = useAtomValue(selectedAreaNoAtom);
	const [editAreaNos, setEditAreaNos] = useAtom(editAreaNosAtom);
	const resetEditAreaNos = useResetAtom(editAreaNoResetAtom);

	const setModeBase = useSetAtom(modeBaseAtom);
	const { setMatchingParam } = useSetMatchingParam();
	const { setInspectionParam } = useSetInspectionParam();
	const { setADCParam } = useSetADCParam();
	const { setCorrectionParam } = useSetCorrectionParam();

	const setRecipeModeParam = useCallback(() => {
		if (
			jobName.length === 0 ||
			!Number.isInteger(selectedAreaNo) ||
			selectedAreaNo <= 0
		)
			return;
		// 取得済みであればセット不要
		if (editAreaNos.includes(selectedAreaNo)) return;
		// モードパラメータ未取得時はAPIから取得
		const controller = new AbortController();
		getRecipeModeParam(jobName, selectedAreaNo, controller.signal)
			.then(async (res) => {
				setModeBase({
					fileID: res.fileID,
					version: res.version,
					revision: res.revision,
					comment: ommitString(res.comment),
				});
				res.matching != null && setMatchingParam(res.matching);
				res.inspection != null && setInspectionParam(res.inspection);
				res.adc != null && setADCParam(res.adc);
				res.correction != null && setCorrectionParam(res.correction);
				setEditAreaNos([...editAreaNos, selectedAreaNo]);
			})
			.catch((error) => {
				if (error.name === "AbortError") return;
				console.error("getRecipeModeParam fetch fail.", error);
			});
		return () => {
			controller.abort();
		};
	}, [
		editAreaNos,
		jobName,
		selectedAreaNo,
		setADCParam,
		setCorrectionParam,
		setEditAreaNos,
		setInspectionParam,
		setMatchingParam,
		setModeBase,
	]);

	return {
		modeBase,
		editAreaNos,
		resetEditAreaNos,
		setRecipeModeParam,
	};
};
