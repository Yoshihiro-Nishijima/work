import { ky } from "lib/ky";

import type { RangedDefectInfo } from "../types";

interface ChipDefectsInfoGetParam {
	resultName: string;
	chips: Array<{
		chipX: number;
		chipY: number;
	}>;
	filterQuery?: string;
}

/** 指定Chip群の欠陥点を取得 */
export const getChipDefectsInfo = async (
	param: ChipDefectsInfoGetParam,
	signal: AbortSignal,
): Promise<RangedDefectInfo[]> => {
	const searchParams = new URLSearchParams();
	for (const chip of param.chips) {
		searchParams.append("chips", `${chip.chipX},${chip.chipY}`);
	}
	if (param.filterQuery != null) {
		const filterParams = new URLSearchParams(param.filterQuery);
		for (const [key, value] of filterParams.entries()) {
			searchParams.append(key, value);
		}
	}

	return await ky
		.get(`results/${param.resultName}/chip-defects`, {
			signal,
			timeout: false,
			searchParams,
		})
		.json<RangedDefectInfo[]>();
};


export const getChipDefectsInfoWithBinning = async (
	param: ChipDefectsInfoGetParam,
	binSize: number,
	signal: AbortSignal,
): Promise<RangedDefectInfo[]> => {
	const searchParams = new URLSearchParams();
	for (const chip of param.chips) {
		searchParams.append("chips", `${chip.chipX},${chip.chipY}`);
	}
	if (param.filterQuery != null) {
		const filterParams = new URLSearchParams(param.filterQuery);
		for (const [key, value] of filterParams.entries()) {
			searchParams.append(key, value);
		}
	}
	searchParams.append("binSize", binSize.toString());

	return await ky
		.get(`results/${param.resultName}/binning-defects`, {
			signal,
			timeout: false,
			searchParams,
		})
		.json<RangedDefectInfo[]>();
}