import { ky } from "lib/ky";

export const getDesigns = async (signal: AbortSignal): Promise<string[]> => {
	return await ky.get("designs", { signal }).json<string[]>();
};
