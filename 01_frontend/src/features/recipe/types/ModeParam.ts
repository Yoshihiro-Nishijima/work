import type {
	ADCParam,
	CorrectionParam,
	InspectionParam,
	MatchingParam,
} from ".";

export interface Area {
	areaNo: number;
	fovWidth: number;
	fovHeight: number;
}

export interface RecipeModeParam {
	fileID: string;
	version: number;
	revision: number;
	comment: string;
	matching?: MatchingParam;
	inspection?: InspectionParam;
	adc?: ADCParam;
	correction?: CorrectionParam;
}
