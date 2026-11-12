import { ky } from "lib/ky";

import type { Design, SearchParam, SearchResults } from "../types";

export const getDesign = async (
	param: SearchParam,
	signal: AbortSignal,
): Promise<SearchResults<Design>> => {
	return await ky
		.post("designs/search", { json: param, signal })
		.json<{ total: number; designs: Design[] }>()
		.then((res) => {
			return {
				total: res.total,
				results: res.designs,
			} satisfies SearchResults<Design>;
		});
};
