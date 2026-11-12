import { ky } from "lib/ky";

type PostDeleteQueueParams = {
	resultNames?: string[];
	toolDatas?: string[];
};

const trimNames = (names: string[]): string[] => {
	return names.map((n) => (n ?? "").trim()).filter((n) => n.length > 0);
};

export const postDeleteQueue = async (
	{ resultNames = [], toolDatas = [] }: PostDeleteQueueParams,
	signal: AbortSignal,
): Promise<unknown> => {
	const trimmedResultNames = trimNames(resultNames);
	const trimmedToolDatas = trimNames(toolDatas);
	// 空/空白のみなら何もしない
	if (trimmedResultNames.length === 0 && trimmedToolDatas.length === 0) return;
	return await ky
		.post("delete-queue", {
			json: {
				result_names: trimmedResultNames,
				tooldata_names: trimmedToolDatas,
			},
			signal,
		})
		.json();
};
