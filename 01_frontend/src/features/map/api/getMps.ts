import { ky } from "lib/ky";

import type { Area } from "~/features/recipe/types";

export const getMps = async (
	resultName: string,
	signal: AbortSignal,
): Promise<Area[]> => {
	return await ky.get(`results/${resultName}/areas`, { signal }).json<Area[]>();
};
