import { describe, expect, it } from "vitest";

import {
	formatHistogramValue,
	getHistogramBinRange,
	getHistogramStep,
	histogramCountFromLog,
	histogramLogCount,
	histogramPercent,
	moveHistogramRange,
	snapHistogramInput,
} from "./rangeValues";

describe("histogram range value helpers", () => {
	it("uses 500 slider divisions and formats according to the step", () => {
		const step = getHistogramStep(10, 20);
		expect(step).toBe(0.02);
		expect(formatHistogramValue(10.123, step)).toBe("10.12");
	});

	it("rejects empty and non-finite numeric input", () => {
		expect(snapHistogramInput("", 0, 10, 0.1)).toBeUndefined();
		expect(snapHistogramInput("Infinity", 0, 10, 0.1)).toBeUndefined();
	});

	it("clamps and snaps input without floating-point step drift", () => {
		expect(snapHistogramInput("10", 0, 1, 0.1)).toBe(1);
		expect(snapHistogramInput("0.3", 0, 1, 0.1)).toBe(0.3);
		expect(snapHistogramInput("2.13", 0, 10, 0.02)).toBe(2.14);
	});

	it("calculates empty-safe percentages and log counts", () => {
		expect(histogramPercent(0, 0)).toBe(0);
		expect(histogramPercent(1, 4)).toBe(25);
		expect(histogramCountFromLog(histogramLogCount(999))).toBe(999);
	});

	it("maps valid bin indices to their inclusive range boundaries", () => {
		expect(getHistogramBinRange([0, 1, 2], 1)).toEqual([1, 2]);
		expect(getHistogramBinRange([0, 1, 2], 2)).toBeUndefined();
	});

	it("moves the selected range by a snapped delta and keeps it within bounds", () => {
		expect(moveHistogramRange([2, 4], 1.03, 0, 10, 0.1)).toEqual([3, 5]);
		expect(moveHistogramRange([8, 10], 2, 0, 10, 0.1)).toEqual([8, 10]);
		expect(moveHistogramRange([2, 4], -5, 0, 10, 0.1)).toEqual([0, 2]);
	});
});
