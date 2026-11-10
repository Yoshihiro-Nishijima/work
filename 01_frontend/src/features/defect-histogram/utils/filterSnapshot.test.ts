import { describe, expect, it } from "vitest";

import { getDefectHistogramFilterSnapshot } from "./filterSnapshot";

describe("getDefectHistogramFilterSnapshot", () => {
	it("excludes an incomplete numeric filter", () => {
		expect(
			getDefectHistogramFilterSnapshot({
				field: "width",
				operator: ">",
				value: "",
			}),
		).toBeUndefined();
	});

	it("keeps a completed filter as an isolated snapshot", () => {
		const item = { field: "width", operator: ">", value: 10 };
		const snapshot = getDefectHistogramFilterSnapshot(item);
		expect(snapshot).toEqual(item);
		expect(snapshot).not.toBe(item);
	});

	it("keeps operators that do not require a value", () => {
		expect(
			getDefectHistogramFilterSnapshot({
				field: "width",
				operator: "isEmpty",
				value: undefined,
			}),
		).toEqual({
			field: "width",
			operator: "isEmpty",
			value: undefined,
		});
	});
});
