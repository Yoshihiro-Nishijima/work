import { ky } from "lib/ky";

/**
 * 最後のResultが含まれているToolDataリストを取得
 * @param names ResultNameリスト
 * @param signal
 * @returns ToolDataリスト. 該当がない場合は空リスト
 */
export const postLastResultToolData = async (
	names: string[],
	signal: AbortSignal,
): Promise<string[]> => {
	// 空/空白のみなら何もしない
	const trimmed = names.map((n) => n.trim()).filter((n) => n.length > 0);
	if (trimmed.length === 0) return [];
	return await ky
		.post("delete-queue/last-result-tooldata", {
			json: { names: trimmed },
			signal,
		})
		.json();
};
