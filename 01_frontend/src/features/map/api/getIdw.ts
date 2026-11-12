import { ky } from "lib/ky";

import type { Idw } from "../types";

export const getIdw = async (
	toolData: string,
	signal: AbortSignal,
): Promise<Idw> => {
	return await ky.get(`tool-data/${toolData}/idw`, { signal }).json<Idw>();
};
