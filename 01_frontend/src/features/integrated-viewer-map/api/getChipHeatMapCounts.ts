import { ky } from "lib/ky";

export interface ChipHeatMapCount {
	chipX: number;
	chipY: number;
	count: number;
}

export const getChipHeatMapCounts = async (
	resultName: string,
	signal: AbortSignal,
): Promise<ChipHeatMapCount[]> =>
	await ky
		.get(`results/${resultName}/chip-defect-counts`, {
			signal,
			timeout: false,
		})
		.json<ChipHeatMapCount[]>();