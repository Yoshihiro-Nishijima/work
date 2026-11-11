const numericFilterOperators = [
	"=",
	"!=",
	">",
	">=",
	"<",
	"<=",
	"isEmpty",
	"isNotEmpty",
	"isAnyOf",
] as const;

type DefectHistogramFieldDefinition = {
	databaseName: string;
	dataType: "number";
	requestValueType: "finite-number";
	histogramEnabled: true;
	filterEnabled: true;
	normalizeValue: "finite-number";
	allowedOperators: typeof numericFilterOperators;
};

const numericField = (
	databaseName: string,
): DefectHistogramFieldDefinition => ({
	databaseName,
	dataType: "number",
	requestValueType: "finite-number",
	histogramEnabled: true,
	filterEnabled: true,
	normalizeValue: "finite-number",
	allowedOperators: numericFilterOperators,
});

export const DEFECT_HISTOGRAM_FIELD_REGISTRY = {
	defectId: numericField("defectId"),
	abnormality: numericField("abnormality"),
	width: numericField("sizeX"),
	height: numericField("sizeY"),
	gray: numericField("gray"),
	grayDiff: numericField("grayDiff"),
	area: numericField("area"),
	mFOVno: numericField("mFOVno"),
	sFOVno: numericField("sFOVno"),
	chipX: numericField("chipX"),
	chipY: numericField("chipY"),
	coordX: numericField("coordX"),
	coordY: numericField("coordY"),
} as const satisfies Record<string, DefectHistogramFieldDefinition>;

export type DefectHistogramField = keyof typeof DEFECT_HISTOGRAM_FIELD_REGISTRY;

export const DEFECT_HISTOGRAM_FIELDS = Object.keys(
	DEFECT_HISTOGRAM_FIELD_REGISTRY,
) as DefectHistogramField[];

export const isDefectHistogramField = (
	field: string,
): field is DefectHistogramField =>
	Object.hasOwn(DEFECT_HISTOGRAM_FIELD_REGISTRY, field);

export const getDefectHistogramFieldDefinition = (
	field: DefectHistogramField,
): DefectHistogramFieldDefinition => DEFECT_HISTOGRAM_FIELD_REGISTRY[field];
