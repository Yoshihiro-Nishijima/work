import { ky } from "~/lib/ky";
import type { PutCategoryMappingParam } from "../types";

export async function putCategoriesMapping(
	datasetType: string,
	datasetName: string,
	updates: PutCategoryMappingParam[],
	signal?: AbortSignal,
): Promise<number> {
	const response = await ky
		.put(`datasets/${datasetType}/${datasetName}/categories/mapping`, {
			json: { updates },
			signal,
		})
		.json<{ totalUpdated: number }>();
	return response.totalUpdated;
}
