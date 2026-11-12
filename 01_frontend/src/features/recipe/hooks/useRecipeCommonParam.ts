import { atom, useAtom, useAtomValue, useSetAtom } from "jotai";
import { useAtomCallback } from "jotai/utils";
import { type Dispatch, type SetStateAction, useCallback } from "react";

import { getRecipeCommon, hasDesign } from "../api";
import {
	DefaultUploadParam,
	type DesignType,
	type JobType,
	type RecipeBase,
	type UploadParam,
} from "../types";
import { ommitString, toFlatDesignLayers } from "../types/converter";
import { useCustomParam } from "./useCustomParam";
import { useImportedParam } from "./useImportedParam";

// 各コンポーネントに合わせて atom は個々に用意

const commonBaseAtom = atom<RecipeBase>({
	fileID: "",
	version: 0,
	revision: 0,
	comment: "",
});
const jobTypeAtom = atom<JobType>("Matching");
const designEnabledAtom = atom(false);
const numDefectsAtom = atom(100);
const designTypeAtom = atom<DesignType | undefined>("Imported");
const outputDesignBasedDefectCoordsAtom = atom(false);
const uploadParam0Atom = atom(DefaultUploadParam());
const uploadParam1Atom = atom(DefaultUploadParam());
const commentSelector = atom(
	(get) => get(commonBaseAtom)?.comment,
	(get, set, newValue: string) => {
		const prev = get(commonBaseAtom);
		if (prev == null || newValue == null) return;
		set(commonBaseAtom, { ...prev, comment: newValue });
	},
);
export const jobNameAtom = atom("");

// Design必須/オプション/未使用
const designUsageSelector = atom((get) => {
	switch (get(jobTypeAtom)) {
		case "Camera":
			return "none";
		case "Matching":
		case "Trainable D2DB":
			return "required";
		default:
			return "optional";
	}
});

// デザインなし/あり
const noDesignSelector = atom(
	(get) =>
		!hasDesign({
			jobType: get(jobTypeAtom),
			design: { enabled: get(designEnabledAtom) },
		}),
);

// Importedエリア表示/非表示
const enableImportedDesignTypeSelector = atom(
	(get) => get(designTypeAtom) === "Imported",
);

// Uploadエリア表示/非表示
const uploadEnableSelector = atom((get) => {
	return get(jobTypeAtom) !== "Camera";
});

// モード別パラメータ利用可能タブインデクスリスト 0: Correction 1: Matching 2: Inspection 3: ADC
const JobTypeModeParamIdx = new Map<JobType, number[]>([
	["Matching", [0, 1]],
	["Trainable D2DB", [0, 1, 2, 3]],
	["Trainable D2D", [0, 1, 2, 3]],
	["Camera", []],
	["C2C", [0, 1, 2, 3]],
	["D2D", [0, 1, 2, 3]],
]);
const modeParamIdxSelector = atom(
	(get) => JobTypeModeParamIdx.get(get(jobTypeAtom)) ?? [],
);

export const useInitRecipeCommonParam = (): ((resultsName: string) => void) => {
	const importedParams = useImportedParam();
	const customParams = useCustomParam();

	return useAtomCallback(
		// biome-ignore lint/correctness/useExhaustiveDependencies: 初回のみ行う(importedParams,customParamsを設定するとループするため除外)
		useCallback((_get, set, resultsName: string) => {
			if (resultsName.length === 0) return;
			const controller = new AbortController();
			getRecipeCommon(resultsName, controller.signal)
				.then(async (res) => {
					set(commonBaseAtom, {
						fileID: res.fileID,
						version: res.version,
						revision: res.revision,
						comment: ommitString(res.comment),
					});
					set(jobTypeAtom, res.jobType);
					set(jobNameAtom, resultsName);
					set(numDefectsAtom, res.numDefects);
					set(designEnabledAtom, res.design.enabled);
					set(designTypeAtom, res.design.designType);
					importedParams.setDesignData(res.design.designData);
					importedParams.setCellName(res.design.cellName);
					importedParams.setOffsetX(res.design.offsetX);
					importedParams.setOffsetY(res.design.offsetY);
					res.design.designLayer != null &&
						importedParams.setDesignLayers(
							toFlatDesignLayers(res.design.designLayer),
						);
					if (res.design.manualLayout != null) {
						customParams.setCategory(res.design.manualLayout.category);
						customParams.setTone(res.design.manualLayout.tone);
						customParams.setSizeX(res.design.manualLayout.sizeX);
						customParams.setSizeY(res.design.manualLayout.sizeY);
						customParams.setPitchX(res.design.manualLayout.pitchX);
						customParams.setPitchY(res.design.manualLayout.pitchY);
						customParams.setShiftX(res.design.manualLayout.shiftX);
						customParams.setShiftY(res.design.manualLayout.shiftY);
					}
					set(
						outputDesignBasedDefectCoordsAtom,
						res.outputDesignBasedDefectCoords,
					);
					set(uploadParam0Atom, res.upload[0] ?? DefaultUploadParam());
					set(uploadParam1Atom, res.upload[1] ?? DefaultUploadParam());
				})
				.catch((error) => {
					if (error.name === "AbortError") return;
					console.error("getRecipeCommon fetch fail.", error);
				});
			return () => {
				controller.abort();
			};
		}, []),
	);
};

interface UseExecuteRecipeCommonParam {
	jobName: string;
	jobType: JobType;
	commonBase: RecipeBase;
	designEnabled: boolean;
	numDefects: number;
	designType: DesignType;
	outputDesignBasedDefectCoords: boolean;
	uploadParam0: UploadParam;
	uploadParam1: UploadParam;
}
export const useExecuteRecipeCommonParam = (): UseExecuteRecipeCommonParam => {
	const jobName = useAtomValue(jobNameAtom);
	const jobType = useAtomValue(jobTypeAtom);
	const commonBase = useAtomValue(commonBaseAtom);
	const designEnabled = useAtomValue(designEnabledAtom);
	const numDefects = useAtomValue(numDefectsAtom);
	const designType = useAtomValue(designTypeAtom) ?? "Custom";
	const outputDesignBasedDefectCoords = useAtomValue(
		outputDesignBasedDefectCoordsAtom,
	);
	const uploadParam0 = useAtomValue(uploadParam0Atom);
	const uploadParam1 = useAtomValue(uploadParam1Atom);

	return {
		jobName,
		jobType,
		commonBase,
		designEnabled,
		numDefects,
		designType,
		outputDesignBasedDefectCoords,
		uploadParam0,
		uploadParam1,
	};
};

interface UseRecipeCommonParams {
	jobType: JobType;
	designType?: DesignType;
	outputDesignBasedDefectCoords: boolean;
	uploadParam0: UploadParam;
	uploadParam1: UploadParam;
	comment: string;
	commonBase: RecipeBase;
	jobName: string;
	numDefects: number;

	enableImported: boolean;
	modeTabIdxes: number[];

	setJobType: Dispatch<SetStateAction<JobType>>;
	setDesignType: Dispatch<SetStateAction<DesignType | undefined>>;
	setUploadParam0: Dispatch<SetStateAction<UploadParam>>;
	setUploadParam1: Dispatch<SetStateAction<UploadParam>>;
	setComment: (value: string) => void;
	setNumDefects: (value: number) => void;
	setOutputDesignBasedDefectCoords: (value: boolean) => void;
}

export const useJobType = (): JobType => useAtomValue(jobTypeAtom);
export const useDesignType = () => useAtomValue(designTypeAtom);
export const useNumDefects = () => useAtom(numDefectsAtom);

export const useRecipeCommonParams = (): UseRecipeCommonParams => {
	const [jobType, setJobType] = useAtom(jobTypeAtom);
	const [designType, setDesignType] = useAtom(designTypeAtom);
	const [outputDesignBasedDefectCoords, setOutputDesignBasedDefectCoords] =
		useAtom(outputDesignBasedDefectCoordsAtom);
	const [uploadParam0, setUploadParam0] = useAtom(uploadParam0Atom);
	const [uploadParam1, setUploadParam1] = useAtom(uploadParam1Atom);
	const [comment, setComment] = useAtom(commentSelector);
	const jobName = useAtomValue(jobNameAtom);
	const commonBase = useAtomValue(commonBaseAtom);
	const [numDefects, setNumDefects] = useAtom(numDefectsAtom);

	const enableImported = useAtomValue(enableImportedDesignTypeSelector);
	const modeTabIdxes = useAtomValue(modeParamIdxSelector);

	return {
		// common params
		jobType,
		designType,
		outputDesignBasedDefectCoords,
		uploadParam0,
		uploadParam1,
		comment,
		commonBase,
		numDefects,
		jobName,
		// Common Params mode flag
		enableImported,
		// Mode Params mode flag
		modeTabIdxes,
		// setter
		setJobType,
		setOutputDesignBasedDefectCoords,
		setUploadParam0,
		setUploadParam1,
		setComment,
		setNumDefects,
		setDesignType,
	};
};

export const useDesignEnabledValue = () => useAtomValue(designEnabledAtom);
export const useSetDesignEnabled = () => useSetAtom(designEnabledAtom);
export const useDesignUsage = () => useAtomValue(designUsageSelector);
export const useNoDesign = () => useAtomValue(noDesignSelector);
export const useUploadEnable = () => useAtomValue(uploadEnableSelector);
