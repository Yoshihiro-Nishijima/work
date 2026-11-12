import { ky } from "lib/ky";

import type { Result, SearchParam, SearchResults } from "../types";

export const getResults = async (
	param: SearchParam,
	signal: AbortSignal,
): Promise<SearchResults<Result>> => {
	return await ky
		.post("results/search", { json: param, signal })
		.json<{ total: number; results: Result[] }>();
};
