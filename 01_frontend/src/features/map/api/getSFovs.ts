import { ky } from "lib/ky";

import type { SFov } from "../types";

export const getSFovs = async (
	resultName: string,
	signal: AbortSignal,
): Promise<SFov[]> => {
	return await ky.get(`results/${resultName}/sfovs`, { signal }).json<SFov[]>();
};
