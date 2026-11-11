import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import type { DefectHistogramItemState } from "../types";
import { DefectHistogramDetailsDialog } from "./DefectHistogramDetailsDialog";
import { DefectHistogramItem } from "./DefectHistogramItem";

afterEach(() => {
	cleanup();
	vi.unstubAllGlobals();
});

const createItem = (
	overrides: Partial<DefectHistogramItemState> = {},
): DefectHistogramItemState => ({
	histogramId: "histogram-1",
	field: "width",
	fieldLabel: "Width",
	status: "idle",
	rangeStatus: "idle",
	result: null,
	range: null,
	rangeResult: null,
	error: null,
	rangeError: null,
	logYAxis: false,
	...overrides,
});

const itemHandlers = {
	onRemove: vi.fn(),
	onRangeChange: vi.fn(),
	onRangeCommit: vi.fn(),
	onDetailsOpen: vi.fn(),
	onReset: vi.fn(),
	onLogYAxisChange: vi.fn(),
};

describe("DefectHistogramItem states", () => {
	it("shows loading state", () => {
		render(
			<DefectHistogramItem
				item={createItem({ status: "loading" })}
				{...itemHandlers}
			/>,
		);

		expect(screen.getByText("Loading...")).toBeTruthy();
	});

	it("shows an empty state for a successful empty result", () => {
		render(
			<DefectHistogramItem
				item={createItem({
					status: "success",
					result: {
						dataMin: null,
						dataMax: null,
						edges: [],
						counts: [],
						categories: [],
						matchedCount: 0,
						numericValueCount: 0,
					},
				})}
				{...itemHandlers}
			/>,
		);

		expect(screen.getByText("数値データがありません")).toBeTruthy();
	});

	it("shows the API error", () => {
		render(
			<DefectHistogramItem
				item={createItem({ status: "error", error: "API error" })}
				{...itemHandlers}
			/>,
		);

		expect(screen.getByText("API error")).toBeTruthy();
	});

	it("keeps category colors and shows the bin tooltip on hover", async () => {
		vi.stubGlobal(
			"matchMedia",
			vi.fn(() => ({
				matches: false,
				addEventListener: vi.fn(),
				removeEventListener: vi.fn(),
			})),
		);
		const item = createItem({
			status: "success",
			result: {
				dataMin: 0,
				dataMax: 10,
				edges: [0, 5, 10],
				counts: [4, 2],
				categories: [
					{ categoryNo: 2, counts: [1, 2] },
					{ categoryNo: 1, counts: [3, 0] },
				],
				matchedCount: 6,
				numericValueCount: 6,
			},
			range: [0, 10],
		});
		const onRangeCommit = vi.fn();
		const { container } = render(
			<DefectHistogramItem
				item={item}
				{...itemHandlers}
				onRangeCommit={onRangeCommit}
			/>,
		);

		expect(screen.getByText("Width")).toBeTruthy();
		const bars = container.querySelectorAll(".MuiBarElement-root");
		expect(bars.length).toBe(4);
		expect(getComputedStyle(bars[0]).fill).toBe("#1976d2");
		expect(getComputedStyle(bars[2]).fill).toBe("#388e3c");

		fireEvent.mouseEnter(bars[0]);
		fireEvent.mouseMove(window, { clientX: 100, clientY: 100 });
		expect(await screen.findByText("CAT1: 3")).toBeTruthy();

		fireEvent.click(bars[0]);
		expect(onRangeCommit).toHaveBeenCalledWith(item, [0, 5]);
	});
});

describe("DefectHistogramDetailsDialog", () => {
	it("shows range counts and keeps the category log-axis switch in the dialog", () => {
		const item = createItem({
			status: "success",
			rangeStatus: "success",
			result: {
				dataMin: 0,
				dataMax: 10,
				edges: [0, 10],
				counts: [10],
				categories: [{ categoryNo: 1, counts: [5] }],
				matchedCount: 10,
				numericValueCount: 10,
			},
			range: [2, 8],
			rangeResult: {
				counts: { left: 2, selected: 6, right: 2 },
				categories: [
					{
						categoryNo: 1,
						counts: { left: 1, selected: 3, right: 1 },
					},
				],
				matchedCount: 10,
				numericValueCount: 10,
			},
		});
		const onLogYAxisChange = vi.fn();
		render(
			<DefectHistogramDetailsDialog
				item={item}
				open
				onClose={vi.fn()}
				onRangeCommit={vi.fn()}
				onLogYAxisChange={onLogYAxisChange}
			/>,
		);

		expect(screen.getByText(/選択範囲: 6 \(60.0%\)/)).toBeTruthy();
		expect(screen.getByText(/CAT1/)).toBeTruthy();
		fireEvent.click(screen.getByLabelText("対数Y軸"));
		expect(onLogYAxisChange).toHaveBeenCalledWith("histogram-1", true);
	});

	it("requests range counts when a valid numeric bound is committed", () => {
		const item = createItem({
			status: "success",
			result: {
				dataMin: 0,
				dataMax: 10,
				edges: [0, 10],
				counts: [4],
				categories: [],
				matchedCount: 4,
				numericValueCount: 4,
			},
			range: [0, 10],
		});
		const onRangeCommit = vi.fn();
		render(
			<DefectHistogramDetailsDialog
				item={item}
				open
				onClose={vi.fn()}
				onRangeCommit={onRangeCommit}
				onLogYAxisChange={vi.fn()}
			/>,
		);

		fireEvent.change(screen.getByLabelText("選択範囲の下限"), {
			target: { value: "2.13" },
		});
		fireEvent.blur(screen.getByLabelText("選択範囲の下限"));

		expect(onRangeCommit).toHaveBeenCalledWith(item, [2.14, 10]);
	});
});
