import { ky } from "lib/ky";

import type { ModelData } from "~/features/ai-training/types";
import type { SearchParam, SearchResults } from "../../job-manager-info/types";

export const getADCModels = async (
	param: SearchParam,
	signal: AbortSignal,
): Promise<SearchResults<ModelData>> => {
	return await ky
		.post("adc/search", {
			json: param,
			signal,
		})
		.json<{ total: number; models: ModelData[] }>()
		.then((res) => {
			return {
				total: res.total,
				results: res.models,
			} satisfies SearchResults<ModelData>;
		});
};
