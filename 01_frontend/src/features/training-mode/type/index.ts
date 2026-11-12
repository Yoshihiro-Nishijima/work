import type { TrainingCountType } from "~/features/training-param-setting/hooks/useTrainingParametersD2D";

// Training(Segmentation)実行API パラメータ
export interface ExecuteTrainingParam {
	trainingType: TrainingType;
	modelName: string;
	baseTrainingType: TrainingType | "";
	baseModelName: string;
	resultName: string;
	trainingCountType: TrainingCountType;
	segmentsTrainingCountType: TrainingCountType;
	trainingCount: number;
	segmentsTrainingCount: number;
	clipLimit: number;
	blockSize: number;
	sigmaColor: number;
	sigmaSpace: number;
	ratio: number;
	numberOfSegments: number;
	dummyRatio: number;
	brightness: boolean;
	blur: boolean;
	zoom: boolean;
	segmentation: boolean;
	iteration: number;
	shadingCorrection: boolean;
	shadingLevel: number;
	gaussFilter: boolean;
	gaussFilterLevel: number;
	dyadic: boolean;
	imageIdList: number[];
}

// Training(Segmentation)実行API レスポンス
export interface ExecuteTrainingResponse {
	status: string;
	details: string;
}

export const TrainingTypeList = ["D2D", "D2DB"] as const;
export const TrainingTypeListText = [
	"Trainable D2D",
	"Trainable D2DB",
] as const;
export type TrainingType = (typeof TrainingTypeList)[number];

// ImportCareArea取得パラメータ
export interface GetCareAreaParam {
	resultName: string;
}
