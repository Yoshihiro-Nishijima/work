import type { JobType } from "~/features/recipe/types/CommonParam";
import type { TrainingType } from "~/features/training-mode/type";
import type { TrainingCountType } from "../hooks/useTrainingParametersD2D";

export interface ModelDetailItem {
	item: string;
	value: string | number;
}

export interface GetTrainingDetailParam {
	type: TrainingType;
	modelName: string;
}

// Training詳細データ
export interface TrainingDetail {
	type: TrainingType;
	modelName: string;
	executionDate: number;
	jobType: JobType;
	processTime: number;
	images: number;
	class: string;
	idw: string;
	idp: string;
	recipe: string;
	comment: string;
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
}

export interface TrainingModelDeleteParam {
	trainingType: TrainingType;
	modelName: string;
}
