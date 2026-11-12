import { LayerTypeList } from "./CommonParam";

export const MatchingLayerTypeList = ["All", ...LayerTypeList] as const;
export const MatchingAreaList = ["Original", "2048", "1024", "512"] as const;
export const MatchingAreaText = [
	"Original",
	"2048 pixel",
	"1024 pixel",
	"512 pixel",
];
export const MatchingMethodList = [
	"Unique Plane",
	"Grad-DL",
	"Imitation",
	"High-Density Imitation",
	"High-Speed Imitation",
] as const;
export const ErosionMitigationList = [
	"Off",
	"1 pixel Erosion",
	"2 pixel Erosion",
	"3 pixel Erosion",
	"1 pixel Dilation",
	"2 pixel Dilation",
	"3 pixel Dilation",
] as const;
export const AlignmentModeList = [
	"Auto",
	"Edge-based",
	"Contrast-based",
] as const;
export const ReductionRatioList = ["1/1", "1/2"] as const;

export type MatchingLayerType = (typeof MatchingLayerTypeList)[number];
export type MatchingArea = (typeof MatchingAreaList)[number];
export type MatchingMethod = (typeof MatchingMethodList)[number];
export type ErosionMitigation = (typeof ErosionMitigationList)[number];
export type AlignmentMode = (typeof AlignmentModeList)[number];
export type ReductionRatio = (typeof ReductionRatioList)[number];

export interface MatchingParam {
	layerType: MatchingLayerType;
	searchArea: number;
	matchingArea: MatchingArea;
	matchingMethod: MatchingMethod;
	erosionMitigation?: ErosionMitigation;
	alignmentMode?: AlignmentMode;
	reductionRatio?: ReductionRatio;
}
