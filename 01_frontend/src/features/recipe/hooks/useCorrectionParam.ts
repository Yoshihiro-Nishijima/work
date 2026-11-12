import { atom, useAtom, useAtomValue } from "jotai";
import { atomFamily } from "jotai/utils";
import type { CorrectionParam, DigitalABCC } from "../types";
import { areaNosAtom, selectedAreaNoAtom } from "./useAreaNos";
import { editAreaNosAtom } from "./useRecipeModeParam";

// AreaNo毎の CorrectionParam
// atomFamily を定義する際に 型指定すると
// 使用時の型推測がうまく働かずに setterの型がneverになってしまうので指定しない
const correctionAtomFamily = atomFamily((_: number) =>
	atom<CorrectionParam | undefined>(undefined),
);

// Re-Executeから取得するために使用
// 関数の中から useAtomValueのようなカスタムフックを呼び出すことはできないため
// Selectorで返す
export const correctionSelector = atom<
	Map<number, CorrectionParam | undefined>
>((get) =>
	get(editAreaNosAtom).reduce(
		(accumulator, areaNo) =>
			accumulator.set(areaNo, get(correctionAtomFamily(areaNo))),
		new Map(),
	),
);

const correctionMagXSelector = atom(
	(get) =>
		get(correctionAtomFamily(get(selectedAreaNoAtom)))?.correctionMagX ?? 0,
);

const correctionMagYSelector = atom(
	(get) =>
		get(correctionAtomFamily(get(selectedAreaNoAtom)))?.correctionMagY ?? 0,
);

const correctionRotationSelector = atom(
	(get) =>
		get(correctionAtomFamily(get(selectedAreaNoAtom)))?.correctionRotation ?? 0,
);

const digitalABCCSelector = atom(
	(get): Partial<DigitalABCC> =>
		get(correctionAtomFamily(get(selectedAreaNoAtom)))?.digitalABCC ?? {},
	(get, set, abcc: Partial<DigitalABCC>) =>
		set(correctionAtomFamily(get(selectedAreaNoAtom)), (prev) => {
			if (prev == null) return prev;
			if (
				(Object.keys(abcc) as (keyof DigitalABCC)[]).every(
					(key) => abcc[key] === prev.digitalABCC[key],
				)
			)
				return prev;

			return { ...prev, digitalABCC: { ...prev.digitalABCC, ...abcc } };
		}),
);

export const updateAllCorrection = atom(null, async (get, set) => {
	const selectedParam = get(correctionAtomFamily(get(selectedAreaNoAtom)));
	// 全てのcorrectionAtomFamilyを更新
	for (const areaNo of await get(areaNosAtom)) {
		set(correctionAtomFamily(areaNo), selectedParam);
	}
});

interface UseSetCorrectionParam {
	setCorrectionParam: (value: CorrectionParam) => void;
	setCorrectionMagX: (value: number) => void;
	setCorrectionMagY: (value: number) => void;
	setCorrectionRotation: (value: number) => void;
}

// CorrectionParam Setterカスタムフック
export const useSetCorrectionParam = (): UseSetCorrectionParam => {
	const selectedAreaNo = useAtomValue(selectedAreaNoAtom);
	const [correctionParam, setter] = useAtom(
		correctionAtomFamily(selectedAreaNo),
	);

	const setCorrectionParam = (value: CorrectionParam): void => {
		setter(value);
	};

	const setCorrectionMagX = (value: number): void => {
		if (correctionParam != null)
			setter({ ...correctionParam, correctionMagX: value });
	};
	const setCorrectionMagY = (value: number): void => {
		if (correctionParam != null)
			setter({ ...correctionParam, correctionMagY: value });
	};
	const setCorrectionRotation = (value: number): void => {
		if (correctionParam != null)
			setter({ ...correctionParam, correctionRotation: value });
	};

	return {
		setCorrectionParam,
		setCorrectionMagX,
		setCorrectionMagY,
		setCorrectionRotation,
	};
};

interface UseCorrectionParam {
	correctionMagX: number;
	correctionMagY: number;
	correctionRotation: number;
}

export const useCorrectionParam = (): UseCorrectionParam => {
	const correctionMagX = useAtomValue(correctionMagXSelector);
	const correctionMagY = useAtomValue(correctionMagYSelector);
	const correctionRotation = useAtomValue(correctionRotationSelector);

	return {
		correctionMagX,
		correctionMagY,
		correctionRotation,
	};
};

export const useDigitalABCC = () => useAtom(digitalABCCSelector);
