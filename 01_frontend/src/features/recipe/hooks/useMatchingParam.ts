import { atom, useAtom, useAtomValue } from "jotai";
import { atomFamily } from "jotai/utils";
import { useCallback } from "react";

import type {
	AlignmentMode,
	ErosionMitigation,
	MatchingArea,
	MatchingLayerType,
	MatchingMethod,
	MatchingParam,
	ReductionRatio,
} from "../types";

import { areaNosAtom, selectedAreaNoAtom } from "./useAreaNos";
import { editAreaNosAtom } from "./useRecipeModeParam";

const searchAreaRange = [2, 96];

// AreaNo毎の MatchingParam
const matchingAtomFamily = atomFamily((_: number) =>
	atom<MatchingParam | undefined>(undefined),
);

// Re-Executeから取得するために使用
// 関数の中から useAtomValueのようなカスタムフックを呼び出すことはできないため
// Selectorで返す
export const matchingSelector = atom<Map<number, MatchingParam>>((get) =>
	get(editAreaNosAtom).reduce(
		(accumulator, areaNo) =>
			accumulator.set(areaNo, get(matchingAtomFamily(areaNo))),
		new Map(),
	),
);

const layerTypeSelector = atom<MatchingLayerType>(
	(get) => get(matchingAtomFamily(get(selectedAreaNoAtom)))?.layerType ?? "All",
);
const searchAreaSelector = atom(
	(get) => get(matchingAtomFamily(get(selectedAreaNoAtom)))?.searchArea ?? 0,
);
const matchingAreaSelector = atom<MatchingArea>(
	(get) =>
		get(matchingAtomFamily(get(selectedAreaNoAtom)))?.matchingArea ??
		"Original",
);
const matchingMethodSelector = atom<MatchingMethod>(
	(get) =>
		get(matchingAtomFamily(get(selectedAreaNoAtom)))?.matchingMethod ??
		"Unique Plane",
);
const erosionMitigationSelector = atom<ErosionMitigation | undefined>(
	(get) => get(matchingAtomFamily(get(selectedAreaNoAtom)))?.erosionMitigation,
);
const alignmentModeSelector = atom<AlignmentMode | undefined>(
	(get) => get(matchingAtomFamily(get(selectedAreaNoAtom)))?.alignmentMode,
);
const reductionRatioSelector = atom<ReductionRatio | undefined>(
	(get) => get(matchingAtomFamily(get(selectedAreaNoAtom)))?.reductionRatio,
);

export const updateAllMatching = atom(null, async (get, set) => {
	const selectedParam = get(matchingAtomFamily(get(selectedAreaNoAtom)));
	// 全てのmatchingAtomFamilyを更新
	for (const areaNo of await get(areaNosAtom)) {
		set(matchingAtomFamily(areaNo), selectedParam);
	}
});

interface useSetMatchingParam {
	setMatchingParam: (value: MatchingParam) => void;
	setLayerType: (value: MatchingLayerType) => void;
	setSearchArea: (value: number) => void;
	setMatchingArea: (value: MatchingArea) => void;
	setMatchingMethod: (value: MatchingMethod) => void;
	setErosionMitigation: (value?: ErosionMitigation) => void;
	setAlignmentMode: (value?: AlignmentMode) => void;
	setReductionRatio: (value?: ReductionRatio) => void;
}

// MatchingParam Setterカスタムフック
export const useSetMatchingParam = (): useSetMatchingParam => {
	const selectedAreaNo = useAtomValue(selectedAreaNoAtom);
	const [matchingParam, setter] = useAtom(matchingAtomFamily(selectedAreaNo));
	const setMatchingParam = useCallback(
		(value: MatchingParam) => {
			setter(value);
		},
		[setter],
	);
	const setLayerType = (value: MatchingLayerType): void => {
		if (matchingParam != null) setter({ ...matchingParam, layerType: value });
	};
	const setSearchArea = (value: number): void => {
		if (matchingParam != null) setter({ ...matchingParam, searchArea: value });
	};
	const setMatchingArea = (value: MatchingArea): void => {
		if (matchingParam != null)
			setter({ ...matchingParam, matchingArea: value });
	};
	const setMatchingMethod = (value: MatchingMethod): void => {
		if (matchingParam != null)
			setter({ ...matchingParam, matchingMethod: value });
	};
	const setErosionMitigation = (value?: ErosionMitigation): void => {
		if (matchingParam != null)
			setter({ ...matchingParam, erosionMitigation: value });
	};
	const setAlignmentMode = (value?: AlignmentMode): void => {
		if (matchingParam != null)
			setter({ ...matchingParam, alignmentMode: value });
	};
	const setReductionRatio = (value?: ReductionRatio): void => {
		if (matchingParam != null)
			setter({ ...matchingParam, reductionRatio: value });
	};
	return {
		setMatchingParam,
		setLayerType,
		setSearchArea,
		setMatchingArea,
		setMatchingMethod,
		setErosionMitigation,
		setAlignmentMode,
		setReductionRatio,
	};
};

interface UseMatchingParam {
	layerType: MatchingLayerType;
	searchArea: number;
	matchingArea: MatchingArea;
	matchingMethod: MatchingMethod;
	erosionMitigation?: ErosionMitigation;
	alignmentMode?: AlignmentMode;
	reductionRatio?: ReductionRatio;
	disabledImitation: () => boolean;
	searchAreaRange: number[];
}

export const useMatchingParam = (): UseMatchingParam => {
	const layerType = useAtomValue(layerTypeSelector);
	const searchArea = useAtomValue(searchAreaSelector);
	const matchingArea = useAtomValue(matchingAreaSelector);
	const matchingMethod = useAtomValue(matchingMethodSelector);
	const erosionMitigation = useAtomValue(erosionMitigationSelector);
	const alignmentMode = useAtomValue(alignmentModeSelector);
	const reductionRatio = useAtomValue(reductionRatioSelector);

	const disabledImitation = useCallback(
		() => !matchingMethod.endsWith("Imitation"),
		[matchingMethod],
	);

	return {
		layerType,
		searchArea,
		matchingArea,
		matchingMethod,
		erosionMitigation,
		alignmentMode,
		reductionRatio,
		disabledImitation,
		searchAreaRange,
	};
};
