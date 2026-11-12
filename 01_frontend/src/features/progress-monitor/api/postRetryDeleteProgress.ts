import { ky } from "lib/ky";

export const postRetryDeleteProgress = async (
	name: string,
	signal: AbortSignal,
): Promise<unknown> => {
	if (!name) return;
	return await ky.post(`delete-queue/${name}/retry`, { signal }).json();
};
