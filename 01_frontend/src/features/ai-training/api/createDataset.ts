import { ky } from "~/lib/ky";

export interface CreateDatasetParam {
	datasetName: string;
	datasetType: string;
	sources: (
		| {
				source_type: "Result";
				resultName: string;
				recipeName: string;
				executionDate: number;
		  }
		| {
				source_type: "Dataset";
				datasetName: string;
				datasetType: string;
		  }
	)[];
}

export interface CreateDatasetResponse {
	datasetId: string;
}

export async function createDataset(
	param: CreateDatasetParam,
	signal?: AbortSignal,
): Promise<CreateDatasetResponse> {
	return ky
		.post("datasets", { json: param, signal })
		.json<CreateDatasetResponse>();
}
