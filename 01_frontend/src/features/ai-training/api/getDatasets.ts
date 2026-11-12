import type {
	SearchParam,
	SearchResults,
} from "~/features/job-manager-info/types";
import { ky } from "~/lib/ky";
import type { Dataset } from "../types";

export async function getDatasets(
	param: SearchParam,
	signal?: AbortSignal,
): Promise<SearchResults<Dataset>> {
	return await ky
		.post("datasets/search", { json: param, signal })
		.json<{ total: number; results: Dataset[] }>();
}
