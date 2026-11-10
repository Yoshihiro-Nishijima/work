import type { DefectHistogramResponse } from "../types";
import { histogramLogCount } from "./rangeValues";

export type DefectHistogramChartData = {
	bin: string;
	[key: string]: string | number;
};

export const mapDefectHistogramChartData = (
	result: DefectHistogramResponse,
	logCategoryCounts = false,
): DefectHistogramChartData[] => {
	if (result.edges.length !== result.counts.length + 1) return [];
	return result.counts.map((count, index) => {
		const row: DefectHistogramChartData = {
			bin: `${result.edges[index]}-${result.edges[index + 1]}`,
			total: count,
		};
		for (const category of result.categories) {
			const count = category.counts[index] ?? 0;
			row[`category-${category.categoryNo}`] = logCategoryCounts
				? histogramLogCount(count)
				: count;
		}
		return row;
	});
};
