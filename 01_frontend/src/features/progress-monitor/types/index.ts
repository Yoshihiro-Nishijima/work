import type { Result } from "~/features/job-manager-info/types";

export interface DiskUsage {
	available: string;
	use: string;
	usePer?: number;
}

export interface DiskUsageData {
	toolData?: DiskUsage;
	result: DiskUsage;
}

export interface JobProgressInfo {
	idx: number;
	id: number;
	name: string;
	status: string;
	processStatus: string;
	executionDate: number;
	jobType: string;
	class: string;
	idw: string;
	idp: string;
	recipe: string;
	port: string;
	slotNo: number;
	lotID: string;
	processID: string;
	operator: string;
	numberOfImages: number;
	numberOfFinished: number;
	progress: number;
	estimatedFinishDate: number;
	cancelable: boolean;
}

export interface TrainingProgressInfo {
	idx: number;
	id: number;
	status: string;
	processState: string;
	jobType: string;
	modelName: string;
	submitDate: number;
	progress: number;
	executionDate: number;
	finishProspectDate: number;
}

export interface CancelTrainingParam {
	id: number;
}

export interface CancelTrainingResponse {
	status: string;
	details: string;
}

export interface CancelParam {
	name: string;
}

export const DeleteProgressStatusList = ["Running", "Queued", "Failed"];
export type DeleteProgressStatus = (typeof DeleteProgressStatusList)[number];
export interface DeleteProgressInfo extends Result {
	idx: number;
	deleteStatus: DeleteProgressStatus;
	deleteError?: string;
	restorable: boolean;
}
