import { ky } from "~/lib/ky";
import type { PutCategoriesByIdParam } from "../types";

export async function putCategoriesById(
	datasetType: string,
	datasetName: string,
	updates: PutCategoriesByIdParam[],
	signal?: AbortSignal,
): Promise<number> {
	const response = await ky
		.put(`datasets/${datasetType}/${datasetName}/categories/by-id`, {
			json: { updates },
			signal,
		})
		.json<{ totalUpdated: number }>();
	return response.totalUpdated;
}
