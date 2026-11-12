import { ky } from "lib/ky";

// Unlock (remove lock) for given result names
export const deleteLockResult = async (
	name: string,
	signal: AbortSignal,
): Promise<unknown> => {
	if (!name) return;
	return await ky.delete(`results/${name}/lock`, { signal }).json();
};
