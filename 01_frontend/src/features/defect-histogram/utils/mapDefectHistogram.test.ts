import { describe, expect, it } from "vitest";

import { mapDefectHistogramChartData } from "./mapDefectHistogram";

describe("mapDefectHistogramChartData", () => {
	it("maps valid edges and counts", () => {
		expect(
			mapDefectHistogramChartData({
				dataMin: 0,
				dataMax: 2,
				edges: [0, 1, 2],
				counts: [3, 4],
				categories: [],
				matchedCount: 7,
				numericValueCount: 7,
			}),
		).toEqual([
			{ bin: "0-1", total: 3 },
			{ bin: "1-2", total: 4 },
		]);
	});

	it("returns an empty chart for an invalid response shape", () => {
		expect(
			mapDefectHistogramChartData({
				dataMin: 0,
				dataMax: 2,
				edges: [0, 1],
				counts: [3, 4],
				categories: [],
				matchedCount: 7,
				numericValueCount: 7,
			}),
		).toEqual([]);
	});

	it("applies log10(1 + count) only to category series when requested", () => {
		const result = mapDefectHistogramChartData(
			{
				dataMin: 0,
				dataMax: 2,
				edges: [0, 1, 2],
				counts: [10, 20],
				categories: [{ categoryNo: 1, counts: [0, 9] }],
				matchedCount: 30,
				numericValueCount: 30,
			},
			true,
		);

		expect(result[0]).toEqual({
			bin: "0-1",
			total: 10,
			"category-1": 0,
		});
		expect(result[1]?.["category-1"]).toBe(1);
	});
});
