import { ky } from "lib/ky";

import type { ResultsRecord } from "../types";

export const getResultsRecord = async (
	target: string,
	signal: AbortSignal,
): Promise<ResultsRecord> => {
	return await ky.get(`results/${target}`, { signal }).json<ResultsRecord>();
};
