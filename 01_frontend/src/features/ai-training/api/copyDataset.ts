import { ky } from "~/lib/ky";
import type { CreateDatasetResponse } from "./createDataset";

export async function copyDataset(
	sourceDatasetType: string,
	sourceDatasetName: string,
	destinationDatasetName: string,
	signal?: AbortSignal,
): Promise<CreateDatasetResponse> {
	return await ky
		.post(`datasets/${sourceDatasetType}/${sourceDatasetName}/copies`, {
			json: { datasetName: destinationDatasetName },
			signal,
		})
		.json<CreateDatasetResponse>();
}
