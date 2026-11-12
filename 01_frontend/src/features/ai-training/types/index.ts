import type { Result as JobManagerResult } from "~/features/job-manager-info/types";
export type Result = JobManagerResult;

export const DatasetTypeList = ["ADC"] as const;
export type DatasetType = (typeof DatasetTypeList)[number];

export const ModelTypeList = ["ADC"] as const;
export type ModelType = (typeof ModelTypeList)[number];

export const SourceTypeList = ["Dataset", "Result"] as const;
export type SourceType = (typeof SourceTypeList)[number];

export const DesignState = {
	NO_DESIGN: 0,
	HAS_DESIGN: 1,
} as const;

export type DesignState = (typeof DesignState)[keyof typeof DesignState];

export interface Dataset {
	datasetType: DatasetType;
	datasetName: string;
	createdDate: number;
	lastModifiedDate: number;
}

export type DatasetSource = {
	id: number;
	sourceType: "Dataset";
	dataset: Dataset;
};

export type ResultSource = {
	id: number;
	sourceType: "Result";
	result: Result;
};

export type Source = DatasetSource | ResultSource;

export type ModelDataset = {
	type: ModelType;
	modelName: string;
	datasetName: string;
	executionDate: number;
};

/**
 * ステータス定義:
 * - 通常フロー: idle -> submitting -> creating -> success
 * - キャンセルフロー: creating -> cancelling -> cancelled
 * - エラー遷移: submitting -> error, creating -> error, cancelling -> error
 * - 再実行: idle / error / cancelled / success から submit 可能
 */
export type CreateDatasetStatus =
	| "idle"
	| "submitting"
	| "creating"
	| "cancelling"
	| "cancelled"
	| "success"
	| "error";

// モデル管理データ
export interface ModelData {
	type: "ADC";
	status: number;
	modelName: string;
	createdDate: number;
	lastModifiedDate: number;
	datasetName: string;
}
