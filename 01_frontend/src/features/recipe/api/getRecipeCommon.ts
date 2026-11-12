import { ky } from "lib/ky";
import merge from "lodash.merge";

import type { JobType, RecipeCommonParam } from "../types";

const getBaseRecipeCommon = (): RecipeCommonParam => {
	return {
		fileID: "MB-MMI-Common",
		version: 1,
		revision: 1,
		comment: "",
		outputDesignBasedDefectCoords: false,
		upload: [],
		jobType: "Camera",
		numDefects: 100,
		design: {
			enabled: false,
			designType: "Imported",
			designData: "",
			cellName: "",
			offsetX: 0.0,
			offsetY: 0.0,
			designLayer: [],
			manualLayout: {
				tone: "Clear",
				category: "Hole",
				sizeX: 10.0,
				sizeY: 10.0,
				pitchX: 25.0,
				pitchY: 25.0,
				shiftX: 12.5,
				shiftY: 12.5,
			},
		},
	};
};

export const getRecipeCommon = async (
	jobName: string,
	signal: AbortSignal,
): Promise<RecipeCommonParam> => {
	const common = await ky
		.get(`results/${jobName}/recipe/common`, { signal })
		.json<Record<string, unknown>>();
	const { version, revision, ...base } = getBaseRecipeCommon();

	const merged = merge(base, { ...common, version, revision });

	ensureFilterDilationInPlace(merged.design.designLayer);

	return merged;
};

/**
 * Ensures that each subLayer in the designLayer array has filterDilationX/Y properties set to 0 if they are undefined.
 * Modifies the input array in place.
 *
 * @param designLayer - The designLayer array to process, expected to be an array of objects with optional 'layers' arrays.
 */
export function ensureFilterDilationInPlace(designLayer: unknown) {
	if (!Array.isArray(designLayer)) return;

	for (const layer of designLayer) {
		const layers = (layer as { layers?: unknown }).layers;

		if (Array.isArray(layers)) {
			for (const subLayer of layers) {
				if (typeof subLayer === "object" && subLayer !== null) {
					if (subLayer.filterDilationX == null) {
						subLayer.filterDilationX = 0;
					}
					if (subLayer.filterDilationY == null) {
						subLayer.filterDilationY = 0;
					}
				}
			}
		}
	}
}

export const isDefectInspection = (jobType: JobType) =>
	jobType !== "Camera" && jobType !== "Matching";

export const hasDesign = ({
	jobType,
	design,
}: Pick<RecipeCommonParam, "jobType"> & {
	design: Pick<RecipeCommonParam["design"], "enabled">;
}): boolean => {
	switch (jobType) {
		case "Matching":
		case "Trainable D2DB":
			return true;
		case "Trainable D2D":
		case "D2D":
		case "C2C":
			return design.enabled;
		default:
			return false;
	}
};
