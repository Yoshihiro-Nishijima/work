import { atom, useAtom, useAtomValue, useSetAtom } from "jotai";
import { atomFamily } from "jotai/utils";

import type { ADCParam } from "~/features/recipe/types";

import { areaNosAtom, selectedAreaNoAtom } from "./useAreaNos";
import { editAreaNosAtom } from "./useRecipeModeParam";

// AreaNo毎の ADCParam
const adcAtomFamily = atomFamily((_: number) =>
	atom<ADCParam>({
		enabled: false,
		model: "",
		uploadClasses: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
	}),
);

// Re-Executeから取得するために使用
// 関数の中から useAtomValueのようなカスタムフックを呼び出すことはできないため
// Selectorで返す
export const adcSelector = atom((get) =>
	get(editAreaNosAtom).reduce(
		(accumulator, areaNo) =>
			accumulator.set(areaNo, get(adcAtomFamily(areaNo))),
		new Map<number, ADCParam>(),
	),
);

const enabledSelector = atom(
	(get) => get(adcAtomFamily(get(selectedAreaNoAtom))).enabled,
	(get, set, enabled: boolean) =>
		set(adcAtomFamily(get(selectedAreaNoAtom)), (adc) => ({ ...adc, enabled })),
);

const modelSelector = atom(
	(get) => get(adcAtomFamily(get(selectedAreaNoAtom))).model,
	(get, set, model: string) =>
		set(adcAtomFamily(get(selectedAreaNoAtom)), (adc) => ({ ...adc, model })),
);

const uploadClassesSelector = atom(
	(get) => get(adcAtomFamily(get(selectedAreaNoAtom))).uploadClasses,
	(get, set, uploadClasses: number[]) =>
		set(adcAtomFamily(get(selectedAreaNoAtom)), (adc) => ({
			...adc,
			uploadClasses,
		})),
);

export const updateAllADC = atom(null, async (get, set) => {
	const selectedParam = get(adcAtomFamily(get(selectedAreaNoAtom)));
	// 全てのadcAtomFamilyを更新
	for (const areaNo of await get(areaNosAtom)) {
		set(adcAtomFamily(areaNo), selectedParam);
	}
});

interface UseSetADCParam {
	setADCParam: (adc: ADCParam) => void;
}

export const useSetADCParam = (): UseSetADCParam => {
	const selectedAreaNo = useAtomValue(selectedAreaNoAtom);
	const setADCParam = useSetAtom(adcAtomFamily(selectedAreaNo));

	return { setADCParam };
};

export const useADCEnabledValue = () => useAtomValue(enabledSelector);
export const useSetADCEnabled = () => useSetAtom(enabledSelector);
export const useADCModel = () => useAtom(modelSelector);
export const useADCUploadClasses = () => useAtom(uploadClassesSelector);
