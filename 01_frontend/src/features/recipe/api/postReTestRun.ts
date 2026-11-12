import { ky } from "lib/ky";

import type { ReTestRunParam } from "../types";

export const postReTestRun = async (
	ResultName: string,
	id: string,
	data: ReTestRunParam,
	signal: AbortSignal,
	timeout = 60000 * 21,
): Promise<unknown> => {
	return await ky
		.post(`test-run/${ResultName}/${id}/submit`, {
			json: data,
			signal,
			timeout,
		})
		.json();
};
