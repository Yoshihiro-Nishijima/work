export * from "./converter";

export interface SearchParam {
	start: number;
	limit: number;
	filter?: Filter;
	sort?: Sort[];
}

export interface SearchResults<T> {
	total?: number;
	results: T[];
}

export interface Pagination {
	pageSize: number;
	page: number;
}

export interface Filter {
	items: Array<{
		field: string;
		operator: string;
		value: number | string | undefined | (number | string)[];
	}>;
	logicOperator?: "and" | "or";
}

export interface Sort {
	field: string;
	direction: "asc" | "desc";
}

export interface Result {
	name: string;
	toolData: string;
	status: number;
	processTime: number;
	executionDate: number;
	reExecuted: number;
	class: string;
	idw: string;
	idp: string;
	recipe: string;
	port: string;
	slotNo: number;
	lotID: string;
	processID: string;
	jobType: string;
	operator: string;
	comment: string;
	imageNum: number;
	error: string;
	diskSize: number;
	isLocked: number;
}

export interface ToolData {
	name: string;
	executionDate: number;
	class: string;
	idw: string;
	idp: string;
	recipe: string;
	port: string;
	slotNo: number;
	lotID: string;
	processID: string;
	operator: string;
	comment: string;
	imageNum: number;
	diskSize: number;
	isLocked: number;
}

export interface Design {
	name: string;
	status: string;
	importDate: number;
	fileType: string;
	cellNum: number;
	layerNum: number;
	layerDatatypeCsv: string;
}

// Node という名前を使うと他ライブラリと被るので NodeData とする
export interface NodeData {
	name: string;
	state: string;
	memoryGiB: number;
	cpus: number;
}

export interface ReUploadParam {
	resultName: string;
	index: number;
}

// Training実行キューデータ
export interface TrainableModelData {
	type: "D2D" | "D2DB";
	status: number;
	modelName: string;
	executionDate: number;
	processTime: number;
	error: string;
	imageNum: number;
	recipe: string;
	resultName: string;
}

// Trainable実行用パラメータ
export interface TrainableDataParam {
	type: "D2D" | "D2DB";
}

// Resultステータス
export const ResultStatus = {
	SUCCESS: 0,
	ERROR: 1,
	WARN: 2,
	CANCEL: 3,
} as const;

// Modelステータス
export const ModelStatus = {
	SUCCESS: 2,
	ERROR: 3,
	CANCEL: 4,
} as const;
