import { ky } from "lib/ky";

import type { Area } from "../types";

export const getAreaNos = async (
	jobName: string,
	signal: AbortSignal,
): Promise<number[]> => {
	return await ky
		.get(`results/${jobName}/areas`, { signal })
		.json<Area[]>()
		.then((res) => res.map((a) => a.areaNo));
};
