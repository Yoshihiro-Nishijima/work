import { ky } from "~/lib/ky";

export type DatasetProgressStatus =
	| "PROCESSING"
	| "COMPLETED"
	| "FAILED"
	| "CANCELED"
	| undefined;

export type DatasetErrorCode =
	| "SOURCE_NOT_FOUND"
	| "SOURCE_IN_DELETION_QUEUE"
	| "SOURCE_DELETED_DURING_CREATION"
	| "SCHEMA_INCOMPATIBLE"
	| "OTHER";

export interface DatasetProgressMetadata {
	dataset_name?: string;
	result_name?: string;
	recipe_name?: string;
	execution_date?: number;
	file_name?: string;
	message?: string;
}

export interface DatasetProgressResponse {
	progress: number;
	status: DatasetProgressStatus;
	error_code?: DatasetErrorCode;
	source_type?: string;
	metadata?: DatasetProgressMetadata;
}

export async function getDatasetProgress(
	id: string,
	signal?: AbortSignal,
): Promise<DatasetProgressResponse> {
	return ky
		.get(`datasets/${id}/progress`, { signal })
		.json<DatasetProgressResponse>();
}
