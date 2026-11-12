import type { RangeValue } from ".";

export const segmentationColorNumList = [
	0x000000, 0x1f77b4, 0xff7f0e, 0x2ca02c, 0xd62728, 0x9467bd, 0x8c564b,
	0xe377c2, 0x7f7f7f, 0xbcbd22, 0x17becf, 0xaec7e8, 0xffbb78, 0x98df8a,
	0xff9896, 0xc5b0d5, 0xc49c94, 0xf7b6d2, 0xc7c7c7, 0xdbdb8d, 0x9edae5,
];
export const segmentationColorList = segmentationColorNumList.map((a) => {
	return `#${a.toString(16).padStart(6, "0")}`;
});

export interface Preprocessing {
	brightnessContrastCorrection: boolean;
	clipLimit: number;
	blockSize: number;
	blur: boolean;
	sigmaColor: number;
	sigmaSpace: number;
	zoom: boolean;
	zoomRatio: number;
}

export interface Detection {
	model: string;
	threshold: number;
	toleranceDistance: number;
	positiveGain: number;
	negativeGain: number;
	searchArea: number;
	matchingDownscaleFactor: number;
	algorithmVersion: number;
}

export interface DefectFeatureExtraction {
	featureAngles: number[];
}
export interface DefectGroup {
	grouping: boolean;
	distance?: number;
}

export interface Clipping {
	fov: number;
}

export interface DefectFilter {
	abnormality: number;
	width: RangeValue;
	height: RangeValue;
	grayscale: RangeValue;
	grayscaleDiff: RangeValue;
	layer: number[];
	layerEnabled?: boolean;
	layerCoverage: number;
	layerOverlap: number;
}

export interface InspectionParam {
	preprocessing: Preprocessing;
	detection: Detection;
	defectFeatureExtraction: DefectFeatureExtraction;
	defectGroup: DefectGroup;
	clipping: Clipping;
	defectFilters: DefectFilter[];
	segSensitivity?: number[];
}

export interface SegmentationInfo {
	exec: boolean;
	numberOfSegments: number;
	sensitivity: number[];
}

export const DEFAULT_DEFECT_FILTER: DefectFilter = {
	abnormality: 0,
	width: { min: 0, max: 12000 },
	height: { min: 0, max: 12000 },
	grayscale: { min: 0, max: 255 },
	grayscaleDiff: { min: -255, max: 255 },
	layer: [],
	layerCoverage: 0,
	layerOverlap: 1,
};
