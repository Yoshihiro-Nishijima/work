// 0 を未設定 (UNSET) として扱う
export const UNSET_CATEGORY = 0 as const;
export const CategoryTypeList = [
	UNSET_CATEGORY,
	1,
	2,
	3,
	4,
	5,
	6,
	7,
	8,
	9,
	10,
] as const;
export type CategoryType = (typeof CategoryTypeList)[number];

export const ModeTypeList = ["New Model", "Existing Model"] as const;
export type ModeType = (typeof ModeTypeList)[number];

export const PredictedTypeList = [
	-1, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10,
] as const;

// CategoryType ごとの表示用カラーコード
export const CategoryTypeColorMap: Record<CategoryType, string> = {
	0: "transparent",
	1: "#1f77b4",
	2: "#ff7f0e",
	3: "#2ca02c",
	4: "#d62728",
	5: "#9467bd",
	6: "#8c564b",
	7: "#e377c2",
	8: "#7f7f7f",
	9: "#bcbd22",
	10: "#17becf",
};

export const KEY_CATEGORY_MAP = {
	"1": 1,
	"2": 2,
	"3": 3,
	"4": 4,
	"5": 5,
	"6": 6,
	"7": 7,
	"8": 8,
	"9": 9,
	"0": 10,
} as const satisfies Record<string, CategoryType>;

export const getCategoryColor = (
	category: CategoryType | undefined,
	fallback = CategoryTypeColorMap[UNSET_CATEGORY],
): string => {
	if (!category) return fallback;
	return CategoryTypeColorMap[category] ?? fallback;
};

export interface FixedImgDataType {
	id: number;
	img: string;
	linearIndex: number;
	outline: string;
	imgbackgroundcolor?: string;
}

export interface FixedDataType {
	columnIndex: number;
	rowIndex: number;
	style: object;
	data: FixedImgDataType[][];
}

export interface DatasetDefect {
	datasetId: number;
	toolExecutionDate: number;
	resultExecutionDate: number;
	toolName: string;
	resultName: string;
	defectId: number;
	topLeftX: number;
	topLeftY: number;
	bottomRightX: number;
	bottomRightY: number;
	abnormality: number;
	defectClass: number;
	className: string;
	recipeName: string;
	gray: number;
	grayDiff: number;
	width: number;
	height: number;
	layers: number[];
	caughtBy: number;
	src: string;
	coordX: number;
	coordY: number;
	chipX: number;
	chipY: number;
	mFOVno: number;
	sFOVno: number;
	defectNo: number;
	area: number;
	predicted: number;
	category: CategoryType;
}

export interface PutCategoriesByIdParam {
	id: number;
	category: number;
}

export interface PutCategoryMappingParam {
	fromCategory: number;
	toCategory: number;
}
