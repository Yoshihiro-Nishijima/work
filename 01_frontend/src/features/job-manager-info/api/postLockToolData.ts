import { ky } from "lib/ky";

export const postLockToolData = async (
	name: string,
	signal: AbortSignal,
): Promise<unknown> => {
	if (!name) return;
	return await ky.post(`tool-data/${name}/lock`, { signal }).json();
};
