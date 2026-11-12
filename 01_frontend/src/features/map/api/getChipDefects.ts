import { ky } from "lib/ky";

import type { ChipDefect } from "../types";

export const getChipDefects = async (
	resultName: string,
	signal: AbortSignal,
): Promise<ChipDefect[]> => {
	return await ky
		.get(`results/${resultName}/chips`, { signal })
		.json<ChipDefect[]>();
};
