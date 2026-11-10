import { ky } from "lib/ky";

import type {
	DefectHistogramRangeRequest,
	DefectHistogramRangeResponse,
	DefectHistogramRequest,
	DefectHistogramResponse,
} from "../types";

export const postDefectHistogram = async (
	resultName: string,
	request: DefectHistogramRequest,
	signal?: AbortSignal,
): Promise<DefectHistogramResponse> => {
	return ky
		.post(`results/${resultName}/defect-histogram`, {
			json: request,
			signal,
			timeout: false,
		})
		.json<DefectHistogramResponse>();
};

export const postDefectHistogramRange = async (
	resultName: string,
	request: DefectHistogramRangeRequest,
	signal?: AbortSignal,
): Promise<DefectHistogramRangeResponse> => {
	return ky
		.post(`results/${resultName}/defect-histogram-range`, {
			json: request,
			signal,
			timeout: false,
		})
		.json<DefectHistogramRangeResponse>();
};
