import { ky } from "lib/ky";

export const postLockResult = async (
	name: string,
	signal: AbortSignal,
): Promise<unknown> => {
	if (!name) return;
	return await ky.post(`results/${name}/lock`, { signal }).json();
};
