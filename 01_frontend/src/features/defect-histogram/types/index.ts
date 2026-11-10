import type { GridFilterItem } from "@mui/x-data-grid-pro";

export const DEFECT_HISTOGRAM_FIELDS = [
	"defectId",
	"abnormality",
	"width",
	"height",
	"gray",
	"grayDiff",
	"area",
	"mFOVno",
	"sFOVno",
	"chipX",
	"chipY",
	"coordX",
	"coordY",
] as const;

export type DefectHistogramField = (typeof DEFECT_HISTOGRAM_FIELDS)[number];

export const isDefectHistogramField = (
	field: string,
): field is DefectHistogramField =>
	(DEFECT_HISTOGRAM_FIELDS as readonly string[]).includes(field);

export type DefectHistogramRequest = {
	field: DefectHistogramField;
	filter?: GridFilterItem;
};

export type DefectHistogramRangeRequest = DefectHistogramRequest & {
	lower: number;
	upper: number;
};

export type DefectHistogramResponse = {
	dataMin: number | null;
	dataMax: number | null;
	edges: number[];
	counts: number[];
	categories: { categoryNo: number; counts: number[] }[];
	matchedCount: number;
	numericValueCount: number;
};

export type DefectHistogramRangeResponse = {
	counts: { left: number; selected: number; right: number };
	categories: {
		categoryNo: number;
		counts: { left: number; selected: number; right: number };
	}[];
	matchedCount: number;
	numericValueCount: number;
};

export type DefectHistogramStatus = "idle" | "loading" | "success" | "error";

export type DefectHistogramItemState = {
	histogramId: string;
	field: DefectHistogramField;
	filter?: GridFilterItem;
	status: DefectHistogramStatus;
	rangeStatus: DefectHistogramStatus;
	result: DefectHistogramResponse | null;
	range: [number, number] | null;
	rangeResult: DefectHistogramRangeResponse | null;
	error: string | null;
	rangeError: string | null;
	logYAxis: boolean;
};
