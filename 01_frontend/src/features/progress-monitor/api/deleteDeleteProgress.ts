import { ky } from "lib/ky";

interface DeleteDeleteProgress {
	name: string;
}

export const deleteDeleteProgress = async (
	prop: DeleteDeleteProgress,
	signal: AbortSignal,
): Promise<unknown> => {
	const { name } = prop;
	// name 未指定なら送信せず undefined 返却
	if (!name) return undefined;
	return await ky.delete(`delete-queue/${name}`, { signal }).json();
};
