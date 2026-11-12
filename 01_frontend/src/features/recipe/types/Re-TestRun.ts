import type {
	ADCParam,
	CorrectionParam,
	DesignLayer,
	InspectionParam,
	MatchingParam,
} from ".";

export interface ReTestRunParam {
	numDefects?: number;
	designLayer?: DesignLayer[];
	matching?: MatchingParam;
	inspection?: InspectionParam;
	adc?: ADCParam;
	correction?: CorrectionParam;
}
