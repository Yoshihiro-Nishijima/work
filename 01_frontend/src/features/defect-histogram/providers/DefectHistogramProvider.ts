import {
	postDefectHistogram,
	postDefectHistogramRange,
} from "../api/defectHistogram";
import type {
	DefectHistogramRangeRequest,
	DefectHistogramRangeResponse,
	DefectHistogramRequest,
	DefectHistogramResponse,
} from "../types";

export interface DefectHistogramProvider {
	getHistogram(
		resultName: string,
		request: DefectHistogramRequest,
		signal?: AbortSignal,
	): Promise<DefectHistogramResponse>;
	getRange(
		resultName: string,
		request: DefectHistogramRangeRequest,
		signal?: AbortSignal,
	): Promise<DefectHistogramRangeResponse>;
}

export class BackendDefectHistogramProvider implements DefectHistogramProvider {
	getHistogram(
		resultName: string,
		request: DefectHistogramRequest,
		signal?: AbortSignal,
	): Promise<DefectHistogramResponse> {
		return postDefectHistogram(resultName, request, signal);
	}

	getRange(
		resultName: string,
		request: DefectHistogramRangeRequest,
		signal?: AbortSignal,
	): Promise<DefectHistogramRangeResponse> {
		return postDefectHistogramRange(resultName, request, signal);
	}
}
