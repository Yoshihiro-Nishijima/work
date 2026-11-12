import { ky } from "lib/ky";

export const deleteLockToolData = async (
	name: string,
	signal: AbortSignal,
): Promise<unknown> => {
	if (!name) return;
	return await ky.delete(`tool-data/${name}/lock`, { signal }).json();
};
