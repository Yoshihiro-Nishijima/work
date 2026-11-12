import { ky } from "lib/ky";

import type { SearchParam, SearchResults, ToolData } from "../types";

export const getToolData = async (
	param: SearchParam,
	signal: AbortSignal,
): Promise<SearchResults<ToolData>> => {
	return await ky
		.post("tool-data/search", { json: param, signal })
		.json<{ total: number; toolData: ToolData[] }>()
		.then((res) => {
			return {
				total: res.total,
				results: res.toolData,
			} satisfies SearchResults<ToolData>;
		});
};
