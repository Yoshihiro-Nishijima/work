import { ky } from "lib/ky";

import type { Filter } from "~/features/job-manager-info/types";

export interface DefectClassCount {
	defectClass: number;
	count: number;
}

export interface DefectClassCountsQuery {
	resultName: string;
	chipX: number;
	chipY: number;
	mFOVno?: number;
	sFOVno?: number;
	filter?: Filter;
}

export const getDefectClassCounts = async (
	query: DefectClassCountsQuery,
	signal: AbortSignal,
): Promise<DefectClassCount[]> => {
	const searchParams = new URLSearchParams({
		chipX: String(query.chipX),
		chipY: String(query.chipY),
	});
	if (query.mFOVno != null) {
		searchParams.set("mFOVno", String(query.mFOVno));
	}
	if (query.sFOVno != null) {
		searchParams.set("sFOVno", String(query.sFOVno));
	}
	if (query.filter != null) {
		searchParams.set("filter", JSON.stringify(query.filter));
	}

	return await ky
		.get(`results/${query.resultName}/defect-class-counts`, {
			signal,
			timeout: false,
			searchParams,
		})
		.json<DefectClassCount[]>();
};
