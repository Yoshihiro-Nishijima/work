import { describe, expect, it } from "vitest";

import {
	DEFECT_HISTOGRAM_FIELD_REGISTRY,
	isDefectHistogramField,
} from "./registry";

describe("defect histogram field registry", () => {
	it("maps frontend field names to the database contract", () => {
		expect(DEFECT_HISTOGRAM_FIELD_REGISTRY.width).toMatchObject({
			databaseName: "sizeX",
			dataType: "number",
			requestValueType: "finite-number",
			histogramEnabled: true,
			filterEnabled: true,
			normalizeValue: "finite-number",
		});
		expect(DEFECT_HISTOGRAM_FIELD_REGISTRY.width.allowedOperators).toContain(
			"isAnyOf",
		);
	});

	it("rejects fields outside the histogram registry", () => {
		expect(isDefectHistogramField("gray")).toBe(true);
		expect(isDefectHistogramField("defectClassName")).toBe(false);
	});
});
