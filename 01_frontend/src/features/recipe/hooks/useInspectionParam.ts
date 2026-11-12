import { type Atom, atom, useAtom, useAtomValue, useSetAtom } from "jotai";
import { atomFamily } from "jotai/utils";
import { useCallback } from "react";

import {
	DEFECT_DISPLAY_NUM,
	selectedDefectDisplayNoAtom,
} from "~/features/display-setting/hooks/useDefectDisplay";

import {
	DEFAULT_DEFECT_FILTER,
	type DefectFilter,
	type InspectionParam,
	type RangeValue,
} from "../types";

import { areaNosAtom, selectedAreaNoAtom } from "./useAreaNos";
import { editAreaNosAtom } from "./useRecipeModeParam";

const inspectionAtomFamily = atomFamily((_: number) =>
	atom<InspectionParam | undefined>(undefined),
);

// Re-Executeから取得するために使用
// 関数の中から useAtomValueのようなカスタムフックを呼び出すことはできないため
// Selectorで返す
export const inspectionSelector = atom<Map<number, InspectionParam>>((get) =>
	get(editAreaNosAtom).reduce(
		(accumulator, areaNo) =>
			accumulator.set(areaNo, get(inspectionAtomFamily(areaNo))),
		new Map(),
	),
);

const modelSelector = atom(
	(get) =>
		get(inspectionAtomFamily(get(selectedAreaNoAtom)))?.detection.model ?? "",
);
const thresholdSelector = atom(
	(get) =>
		get(inspectionAtomFamily(get(selectedAreaNoAtom)))?.detection.threshold ??
		0,
);
const toleranceDistanceSelector = atom(
	(get) =>
		get(inspectionAtomFamily(get(selectedAreaNoAtom)))?.detection
			.toleranceDistance ?? 0,
);
const positiveGainSelector = atom(
	(get) =>
		get(inspectionAtomFamily(get(selectedAreaNoAtom)))?.detection
			.positiveGain ?? 0,
);
const negativeGainSelector = atom(
	(get) =>
		get(inspectionAtomFamily(get(selectedAreaNoAtom)))?.detection
			.negativeGain ?? 0,
);
const groupingSelector = atom(
	(get) =>
		get(inspectionAtomFamily(get(selectedAreaNoAtom)))?.defectGroup.grouping ??
		false,
);

const distanceSelector = atom<number | undefined>(
	(get) =>
		get(inspectionAtomFamily(get(selectedAreaNoAtom)))?.defectGroup.distance,
);

const defectFilterSelector = atom<DefectFilter[]>(
	(get) =>
		get(inspectionAtomFamily(get(selectedAreaNoAtom)))?.defectFilters ?? [],
);

const abnormalitySelector = atomFamily<number, Atom<number>>((no: number) =>
	atom(
		(get) =>
			get(inspectionAtomFamily(get(selectedAreaNoAtom)))?.defectFilters[no]
				.abnormality ?? 0,
	),
);

const widthSelector = atomFamily<number, Atom<RangeValue>>((no: number) =>
	atom(
		(get) =>
			get(inspectionAtomFamily(get(selectedAreaNoAtom)))?.defectFilters[no]
				.width ?? { min: 0, max: 12000 },
	),
);

const heightSelector = atomFamily<number, Atom<RangeValue>>((no: number) =>
	atom(
		(get) =>
			get(inspectionAtomFamily(get(selectedAreaNoAtom)))?.defectFilters[no]
				.height ?? { min: 0, max: 12000 },
	),
);

const grayscaleSelector = atomFamily<number, Atom<RangeValue>>((no: number) =>
	atom(
		(get) =>
			get(inspectionAtomFamily(get(selectedAreaNoAtom)))?.defectFilters[no]
				.grayscale ?? { min: 0, max: 255 },
	),
);

const grayscaleDiffSelector = atomFamily<number, Atom<RangeValue>>(
	(no: number) =>
		atom(
			(get) =>
				get(inspectionAtomFamily(get(selectedAreaNoAtom)))?.defectFilters[no]
					.grayscaleDiff ?? { min: -255, max: 255 },
		),
);

const layerEnabledSelector = atomFamily<number, Atom<boolean>>((no: number) =>
	atom(
		(get) =>
			get(inspectionAtomFamily(get(selectedAreaNoAtom)))?.defectFilters[no]
				.layerEnabled ?? false,
	),
);

const layerCoverageSelector = atomFamily<number, Atom<number>>((no: number) =>
	atom(
		(get) =>
			get(inspectionAtomFamily(get(selectedAreaNoAtom)))?.defectFilters[no]
				.layerCoverage ?? 0,
	),
);

const layerOverlapSelector = atomFamily<number, Atom<number>>((no: number) =>
	atom(
		(get) =>
			get(inspectionAtomFamily(get(selectedAreaNoAtom)))?.defectFilters[no]
				.layerOverlap ?? 0,
	),
);

const layerFilterSelector = atomFamily(
	// 値としては number だがコンポーネント側で使用するために string 変換
	(no: number) =>
		atom(
			(get) =>
				get(inspectionAtomFamily(get(selectedAreaNoAtom)))?.defectFilters[
					no
				].layer.map((l) => l.toString()) ?? [],
			(get, set, newValue: string[]) => {
				const prev = get(inspectionAtomFamily(get(selectedAreaNoAtom)));
				if (prev == null) return;

				const prevLayer = prev.defectFilters[no].layer;
				const layer = Array.from(new Set(newValue.map(Number))).sort();
				if (
					prevLayer.length === layer.length &&
					prevLayer.every((v, i) => v === layer[i])
				)
					return;

				const defectFilters = [...prev.defectFilters];
				defectFilters[no] = { ...defectFilters[no], layer };

				set(inspectionAtomFamily(get(selectedAreaNoAtom)), {
					...prev,
					defectFilters,
				});
			},
		),
);

const clippingFovSelector = atom(
	(get) =>
		get(inspectionAtomFamily(get(selectedAreaNoAtom)))?.clipping.fov ?? 0,
);

const segSensitivitySelector = atom<number[]>(
	(get) =>
		get(inspectionAtomFamily(get(selectedAreaNoAtom)))?.segSensitivity ?? [],
);

export const updateAllInspection = atom(null, async (get, set) => {
	const selectedParam = get(inspectionAtomFamily(get(selectedAreaNoAtom)));
	// 全てのinspectionAtomFamilyを更新
	for (const areaNo of await get(areaNosAtom)) {
		set(inspectionAtomFamily(areaNo), selectedParam);
	}
});

interface UseSetInspectionParam {
	setInspectionParam: (value: InspectionParam) => void;
	setBrightnessContrastCorrection: (value: boolean) => void;
	setClipLimit: (value: number) => void;
	setBlockSize: (value: number) => void;
	setBlur: (value: boolean) => void;
	setSigmaColor: (value: number) => void;
	setSigmaSpace: (value: number) => void;
	setZoom: (value: boolean) => void;
	setZoomRatio: (value: number) => void;
	setModel: (value: string) => void;
	setThreshold: (value: number) => void;
	setToleranceDistance: (value: number) => void;
	setPositiveGain: (value: number) => void;
	setNegativeGain: (value: number) => void;
	setSearchArea: (value: number) => void;
	setMatchingDownscaleFactor: (value: number) => void;
	setAlgolithmVersion: (value: number) => void;
	setFeatureAngles: (value: number[]) => void;
	setGrouping: (value: boolean) => void;
	setDistance: (value: number | undefined) => void;
	setAbnormality: (value: number) => void;
	setWidth: (value: RangeValue) => void;
	setHeight: (value: RangeValue) => void;
	setGrayscale: (value: RangeValue) => void;
	setGrayscaleDiff: (value: RangeValue) => void;
	setClippingFov: (value: number) => void;
	setLayerFilter: (value: string[]) => void;
	setLayerEnabled: (value: boolean) => void;
	setLayerCoverage: (value: number) => void;
	setLayerOverlap: (value: number) => void;
	setSegSensitivity: (value: number[]) => void;
}

// InspectionParam Setterカスタムフック
export const useSetInspectionParam = (): UseSetInspectionParam => {
	const selectedAreaNo = useAtomValue(selectedAreaNoAtom);
	const selectedDefectDisplayNo = useAtomValue(selectedDefectDisplayNoAtom);
	const [inspectionParam, setter] = useAtom(
		inspectionAtomFamily(selectedAreaNo),
	);

	const setInspectionParam = useCallback(
		(value: InspectionParam) => {
			if (!Array.isArray(value.defectFilters)) {
				value.defectFilters = [...Array(DEFECT_DISPLAY_NUM)].map((_) => {
					return DEFAULT_DEFECT_FILTER;
				});
			}
			setter(value);
		},
		[setter],
	);
	const setBrightnessContrastCorrection = (value: boolean): void => {
		if (inspectionParam != null) {
			setter({
				...inspectionParam,
				preprocessing: {
					...inspectionParam.preprocessing,
					brightnessContrastCorrection: value,
				},
			});
		}
	};
	const setClipLimit = (value: number): void => {
		if (inspectionParam != null) {
			setter({
				...inspectionParam,
				preprocessing: { ...inspectionParam.preprocessing, clipLimit: value },
			});
		}
	};
	const setBlockSize = (value: number): void => {
		if (inspectionParam != null) {
			setter({
				...inspectionParam,
				preprocessing: { ...inspectionParam.preprocessing, blockSize: value },
			});
		}
	};
	const setBlur = (value: boolean): void => {
		if (inspectionParam != null) {
			setter({
				...inspectionParam,
				preprocessing: { ...inspectionParam.preprocessing, blur: value },
			});
		}
	};
	const setSigmaColor = (value: number): void => {
		if (inspectionParam != null) {
			setter({
				...inspectionParam,
				preprocessing: { ...inspectionParam.preprocessing, sigmaColor: value },
			});
		}
	};
	const setSigmaSpace = (value: number): void => {
		if (inspectionParam != null) {
			setter({
				...inspectionParam,
				preprocessing: { ...inspectionParam.preprocessing, sigmaSpace: value },
			});
		}
	};
	const setZoom = (value: boolean): void => {
		if (inspectionParam != null) {
			setter({
				...inspectionParam,
				preprocessing: { ...inspectionParam.preprocessing, zoom: value },
			});
		}
	};
	const setZoomRatio = (value: number): void => {
		if (inspectionParam != null) {
			setter({
				...inspectionParam,
				preprocessing: { ...inspectionParam.preprocessing, zoomRatio: value },
			});
		}
	};
	const setModel = (value: string): void => {
		if (inspectionParam != null) {
			setter({
				...inspectionParam,
				detection: { ...inspectionParam.detection, model: value },
			});
		}
	};
	const setThreshold = (value: number): void => {
		if (inspectionParam != null) {
			setter({
				...inspectionParam,
				detection: { ...inspectionParam.detection, threshold: value },
			});
		}
	};
	const setToleranceDistance = (value: number): void => {
		if (inspectionParam != null) {
			setter({
				...inspectionParam,
				detection: { ...inspectionParam.detection, toleranceDistance: value },
			});
		}
	};
	const setPositiveGain = (value: number): void => {
		if (inspectionParam != null) {
			setter({
				...inspectionParam,
				detection: { ...inspectionParam.detection, positiveGain: value },
			});
		}
	};
	const setNegativeGain = (value: number): void => {
		if (inspectionParam != null) {
			setter({
				...inspectionParam,
				detection: { ...inspectionParam.detection, negativeGain: value },
			});
		}
	};
	const setSearchArea = (value: number): void => {
		if (inspectionParam != null) {
			setter({
				...inspectionParam,
				detection: { ...inspectionParam.detection, searchArea: value },
			});
		}
	};
	const setMatchingDownscaleFactor = (value: number): void => {
		if (inspectionParam != null) {
			setter({
				...inspectionParam,
				detection: {
					...inspectionParam.detection,
					matchingDownscaleFactor: value,
				},
			});
		}
	};
	const setAlgolithmVersion = (value: number): void => {
		if (inspectionParam != null) {
			setter({
				...inspectionParam,
				detection: { ...inspectionParam.detection, algorithmVersion: value },
			});
		}
	};
	const setGrouping = (value: boolean): void => {
		if (inspectionParam != null) {
			setter({
				...inspectionParam,
				defectGroup: { ...inspectionParam.defectGroup, grouping: value },
			});
		}
	};
	const setDistance = (value: number | undefined): void => {
		if (inspectionParam != null) {
			setter({
				...inspectionParam,
				defectGroup: { ...inspectionParam.defectGroup, distance: value },
			});
		}
	};
	const setAbnormality = (value: number): void => {
		if (inspectionParam != null) {
			setter(() => {
				const defectFilters = [...inspectionParam.defectFilters];
				defectFilters[selectedDefectDisplayNo] = {
					...defectFilters[selectedDefectDisplayNo],
					abnormality: value,
				};

				return {
					...inspectionParam,
					defectFilters,
				};
			});
		}
	};
	const setWidth = (value: RangeValue): void => {
		if (inspectionParam != null) {
			setter(() => {
				const defectFilters = [...inspectionParam.defectFilters];
				defectFilters[selectedDefectDisplayNo] = {
					...defectFilters[selectedDefectDisplayNo],
					width: value,
				};

				return {
					...inspectionParam,
					defectFilters,
				};
			});
		}
	};
	const setHeight = (value: RangeValue): void => {
		if (inspectionParam != null) {
			setter(() => {
				const defectFilters = [...inspectionParam.defectFilters];
				defectFilters[selectedDefectDisplayNo] = {
					...defectFilters[selectedDefectDisplayNo],
					height: value,
				};

				return {
					...inspectionParam,
					defectFilters,
				};
			});
		}
	};
	const setGrayscale = (value: RangeValue): void => {
		if (inspectionParam != null) {
			setter(() => {
				const defectFilters = [...inspectionParam.defectFilters];
				defectFilters[selectedDefectDisplayNo] = {
					...defectFilters[selectedDefectDisplayNo],
					grayscale: value,
				};

				return {
					...inspectionParam,
					defectFilters,
				};
			});
		}
	};
	const setGrayscaleDiff = (value: RangeValue): void => {
		if (inspectionParam != null) {
			setter(() => {
				const defectFilters = [...inspectionParam.defectFilters];
				defectFilters[selectedDefectDisplayNo] = {
					...defectFilters[selectedDefectDisplayNo],
					grayscaleDiff: value,
				};

				return {
					...inspectionParam,
					defectFilters,
				};
			});
		}
	};
	const setLayerFilter = useSetAtom(
		layerFilterSelector(selectedDefectDisplayNo),
	);
	const setLayerEnabled = (value: boolean): void => {
		if (inspectionParam != null) {
			setter(() => {
				const defectFilters = [...inspectionParam.defectFilters];
				defectFilters[selectedDefectDisplayNo] = {
					...defectFilters[selectedDefectDisplayNo],
					layerEnabled: value,
				};

				return {
					...inspectionParam,
					defectFilters,
				};
			});
		}
	};
	const setLayerCoverage = (value: number): void => {
		if (inspectionParam != null) {
			setter(() => {
				const defectFilters = [...inspectionParam.defectFilters];
				defectFilters[selectedDefectDisplayNo] = {
					...defectFilters[selectedDefectDisplayNo],
					layerCoverage: value,
				};

				return {
					...inspectionParam,
					defectFilters,
				};
			});
		}
	};
	const setLayerOverlap = (value: number): void => {
		if (inspectionParam != null) {
			setter(() => {
				const defectFilters = [...inspectionParam.defectFilters];
				defectFilters[selectedDefectDisplayNo] = {
					...defectFilters[selectedDefectDisplayNo],
					layerOverlap: value,
				};

				return {
					...inspectionParam,
					defectFilters,
				};
			});
		}
	};
	const setClippingFov = (value: number): void => {
		if (inspectionParam != null) {
			setter({
				...inspectionParam,
				clipping: { ...inspectionParam.clipping, fov: value },
			});
		}
	};
	const setSegSensitivity = (value: number[]): void => {
		if (inspectionParam != null) {
			setter({
				...inspectionParam,
				segSensitivity: value,
			});
		}
	};
	const setFeatureAngles = (value: number[]): void => {
		if (inspectionParam != null) {
			setter({
				...inspectionParam,
				defectFeatureExtraction: {
					...inspectionParam.defectFeatureExtraction,
					featureAngles: value,
				},
			});
		}
	};
	return {
		setInspectionParam,
		setBrightnessContrastCorrection,
		setClipLimit,
		setBlockSize,
		setBlur,
		setSigmaColor,
		setSigmaSpace,
		setZoom,
		setZoomRatio,
		setModel,
		setThreshold,
		setToleranceDistance,
		setPositiveGain,
		setNegativeGain,
		setSearchArea,
		setMatchingDownscaleFactor,
		setAlgolithmVersion,
		setFeatureAngles,
		setGrouping,
		setDistance,
		setAbnormality,
		setWidth,
		setHeight,
		setGrayscale,
		setGrayscaleDiff,
		setClippingFov,
		setLayerFilter,
		setLayerEnabled,
		setLayerCoverage,
		setLayerOverlap,
		setSegSensitivity,
	};
};

export interface UseInspectionParam {
	brightnessContrastCorrection: boolean;
	clipLimit: number;
	blockSize: number;
	blur: boolean;
	sigmaColor: number;
	sigmaSpace: number;
	zoom: boolean;
	zoomRatio: number;
	model: string;
	threshold: number;
	toleranceDistance: number;
	positiveGain: number;
	negativeGain: number;
	searchArea: number;
	matchingDownscaleFactor: number;
	algolithmVersion: number;
	featureAngles: number[];
	grouping: boolean;
	distance?: number;
	abnormality: number;
	defectFilter: DefectFilter[];
	width: RangeValue;
	height: RangeValue;
	grayscale: RangeValue;
	grayscaleDiff: RangeValue;
	clippingFov: number;
	layerFilter: string[];
	layerEnabled: boolean;
	layerCoverage: number;
	layerOverlap: number;
	segSensitivity: number[];
}

export const useInspectionParam = (): UseInspectionParam => {
	const model = useAtomValue(modelSelector);
	const threshold = useAtomValue(thresholdSelector);
	const toleranceDistance = useAtomValue(toleranceDistanceSelector);
	const grouping = useAtomValue(groupingSelector);
	const distance = useAtomValue(distanceSelector);
	const positiveGain = useAtomValue(positiveGainSelector);
	const negativeGain = useAtomValue(negativeGainSelector);

	const defectFilter = useAtomValue(defectFilterSelector);
	const selectedDefectDisplayNo = useAtomValue(selectedDefectDisplayNoAtom);
	const abnormality = useAtomValue(
		abnormalitySelector(selectedDefectDisplayNo),
	);
	const width = useAtomValue(widthSelector(selectedDefectDisplayNo));
	const height = useAtomValue(heightSelector(selectedDefectDisplayNo));

	const grayscale = useAtomValue(grayscaleSelector(selectedDefectDisplayNo));
	const grayscaleDiff = useAtomValue(
		grayscaleDiffSelector(selectedDefectDisplayNo),
	);
	const clippingFov = useAtomValue(clippingFovSelector);
	const layerEnabled = useAtomValue(
		layerEnabledSelector(selectedDefectDisplayNo),
	);
	const layerCoverage = useAtomValue(
		layerCoverageSelector(selectedDefectDisplayNo),
	);
	const layerOverlap = useAtomValue(
		layerOverlapSelector(selectedDefectDisplayNo),
	);

	const layerFilter = useAtomValue(
		layerFilterSelector(selectedDefectDisplayNo),
	);

	const segSensitivity = useAtomValue(segSensitivitySelector);

	const selectedAreaNo = useAtomValue(selectedAreaNoAtom);
	const inspectionParam = useAtomValue(inspectionAtomFamily(selectedAreaNo));
	const preprocessing = inspectionParam?.preprocessing;

	const brightnessContrastCorrection =
		preprocessing?.brightnessContrastCorrection ?? false;
	const clipLimit = preprocessing?.clipLimit ?? 0;
	const blockSize = preprocessing?.blockSize ?? 0;
	const blur = preprocessing?.blur ?? false;
	const sigmaColor = preprocessing?.sigmaColor ?? 0;
	const sigmaSpace = preprocessing?.sigmaSpace ?? 0;
	const zoom = preprocessing?.zoom ?? false;
	const zoomRatio = preprocessing?.zoomRatio ?? 0;
	const searchArea = inspectionParam?.detection.searchArea ?? 0;
	const matchingDownscaleFactor =
		inspectionParam?.detection.matchingDownscaleFactor ?? 3;
	const algolithmVersion =
		inspectionParam?.detection.algorithmVersion === 0 ? 0 : 1;
	const featureAngles = inspectionParam?.defectFeatureExtraction
		.featureAngles ?? [0.0, 45.0, 90.0, 135.0];

	return {
		brightnessContrastCorrection,
		clipLimit,
		blockSize,
		blur,
		sigmaColor,
		sigmaSpace,
		zoom,
		zoomRatio,
		model,
		threshold,
		toleranceDistance,
		grouping,
		distance,
		positiveGain,
		negativeGain,
		searchArea,
		matchingDownscaleFactor,
		algolithmVersion,
		featureAngles,
		defectFilter,
		abnormality,
		width,
		height,
		grayscale,
		grayscaleDiff,
		clippingFov,
		layerFilter,
		layerEnabled,
		layerCoverage,
		layerOverlap,
		segSensitivity,
	};
};
