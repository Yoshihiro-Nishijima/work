import { ky } from "lib/ky";

import type { DefectRecord } from "~/features/defect-list/types";

import type { TestRunDefectGetParam } from "../types";

export const getTestRunDefect = async (
	param: TestRunDefectGetParam,
	signal: AbortSignal,
): Promise<{ total: number; defects: DefectRecord[] }> => {
	return await ky
		.get(`test-run/${param.resultName}/${param.id}/defects`, { signal })
		.json<{ total: number; defects: DefectRecord[] }>();
};
