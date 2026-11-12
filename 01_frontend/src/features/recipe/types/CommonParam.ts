export const JobTypeList = [
	"Matching",
	"Trainable D2DB",
	"Trainable D2D",
	"D2D",
	"C2C",
	"Camera",
] as const;
export type JobType = (typeof JobTypeList)[number];

export const DesignTypeList = ["Imported", "Custom"] as const;
export type DesignType = (typeof DesignTypeList)[number];

export const LayerTypeList = [
	"Target",
	"Lower",
	"Lower2",
	"Reference",
] as const;
export type LayerType = (typeof LayerTypeList)[number];

export const ToneTypeList = ["Clear", "Dark"] as const;
export type ToneType = (typeof ToneTypeList)[number];

export const ProcessTypeList = ["Normal", "Cutting"] as const;
export type ProcessType = (typeof ProcessTypeList)[number];

export const CategoryTypeList = ["V-Line", "H-Line", "Hole"] as const;
export type CategoryType = (typeof CategoryTypeList)[number];

export interface ManualLayout {
	category?: CategoryType;
	tone?: ToneType;
	sizeX?: number;
	pitchX?: number;
	shiftX?: number;
	sizeY?: number;
	pitchY?: number;
	shiftY?: number;
}

export interface Design {
	enabled: boolean;
	designType: DesignType;
	manualLayout?: ManualLayout;
	designData?: string;
	cellName?: string;
	offsetX?: number;
	offsetY?: number;
	designLayer?: DesignLayer[];
}

export interface UploadParam {
	enabled?: boolean;
	server?: string;
	defectImages?: boolean;
	umMarker?: boolean;
}
export const DefaultUploadParam = (): UploadParam => {
	return { enabled: false, server: "", defectImages: false, umMarker: false };
};

export interface RecipeBase {
	fileID: string;
	version: number;
	revision: number;
	comment: string;
}

export type RecipeCommonParam = RecipeBase & {
	jobType: JobType;
	numDefects: number;
	design: Design;
	outputDesignBasedDefectCoords: boolean;
	upload: UploadParam[];
};

export interface Layer {
	layerNo: number;
	dataType: number;
	filterDilationX: number;
	filterDilationY: number;
}

export interface DesignLayer {
	layerID?: number;
	type?: LayerType;
	tone?: ToneType;
	process?: ProcessType;
	layers: Layer[];
}

export type FlatDesignLayer = Omit<DesignLayer, "layers"> &
	Layer & { id: number; parentID?: number };

export interface IsReadonlyProp {
	isReadonly?: boolean;
}
