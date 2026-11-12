import { ky } from "lib/ky";

import type { CancelParam as CancelJobParam } from "../types";

export const postCancelJob = async (
	param: CancelJobParam,
	signal: AbortSignal,
): Promise<unknown> => {
	return await ky.post(`jobs/${param.name}/cancel`, { signal }).json();
};
