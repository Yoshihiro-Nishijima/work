import { atom, useAtom, useAtomValue } from "jotai";
import { loadable } from "jotai/utils";
import { getAreaNos } from "../api/getAreaNos";

import { jobNameAtom } from "./useRecipeCommonParam";

// 選択中エリアNo 各モードパラメータから参照する必要があるのでexport
export const selectedAreaNoAtom = atom(0);
interface UseSelectedAreaNo {
	selectedAreaNo: number;
	setSelectedAreaNo: (selectedAreaNo: number) => void;
}
export const useSelectedAreaNo = (): UseSelectedAreaNo => {
	const [selectedAreaNo, setSelectedAreaNo] = useAtom(selectedAreaNoAtom);
	return { selectedAreaNo, setSelectedAreaNo };
};

// モード別パラメータのコピー処理用に全ての エリアNo.をexport
// 非同期atomパターンを使用してAPI取得を管理
export const areaNosAtom = atom(async (get, { signal }) => {
	const jobName = get(jobNameAtom);
	if (jobName.length === 0) return [];

	try {
		const areaNos = await getAreaNos(jobName, signal);
		return areaNos;
	} catch (error) {
		console.error("getAreaNos fetch fail.", error);
		return [];
	}
});

const areaNosLoadableAtom = loadable(areaNosAtom);

export const useAreaNos = (): { areaNos: number[]; loading: boolean } => {
	const loadableAreaNos = useAtomValue(areaNosLoadableAtom);

	if (loadableAreaNos.state === "loading") {
		return { areaNos: [], loading: true };
	}
	if (loadableAreaNos.state === "hasError") {
		console.error(loadableAreaNos.error);
		return { areaNos: [], loading: false };
	}
	return { areaNos: loadableAreaNos.data, loading: false };
};
