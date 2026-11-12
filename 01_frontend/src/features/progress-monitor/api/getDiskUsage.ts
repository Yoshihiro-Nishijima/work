import { ky } from "lib/ky";

import type { DiskUsageData } from "../types";

export const getDiskUsage = async (
	signal: AbortSignal,
): Promise<DiskUsageData> => {
	return await ky.get("storage", { signal }).json<DiskUsageData>();
};
