import { ky } from "lib/ky";

import type { JobProgressInfo } from "../types";

export const getJobProgressList = async (
	signal: AbortSignal,
): Promise<JobProgressInfo[]> => {
	return await ky.get("jobs", { signal }).json<JobProgressInfo[]>();
};
