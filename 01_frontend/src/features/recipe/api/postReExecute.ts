import { ky } from "lib/ky";

import type { ReExecuteParam } from "../types";

export const postReExecute = async (
	jobName: string,
	data: ReExecuteParam,
	signal: AbortSignal,
): Promise<unknown> => {
	return await ky
		.post(`results/${jobName}/re-execute`, {
			json: data,
			signal,
			timeout: 5 * 60 * 1000,
		})
		.json();
};
