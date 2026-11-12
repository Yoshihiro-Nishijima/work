import { atom, useAtomValue } from "jotai";

import { resultNameAtom } from "~/features/misc/hooks/useResultName";
import {
	getRecipeCommon,
	hasDesign,
	isDefectInspection,
} from "~/features/recipe/api";
import type { JobType } from "~/features/recipe/types";

interface UseResultJobType {
	jobType?: JobType;
	enableDefect: boolean;
	enableDesign: boolean;
	enableBoxSegment: boolean;
	enableIntermediate: boolean;
	hasReferences: boolean;
}
const DefaultResultJobType: UseResultJobType = {
	jobType: undefined,
	enableDefect: false,
	enableDesign: false,
	enableBoxSegment: false,
	enableIntermediate: false,
	hasReferences: false,
};
const resultJobTypeSelector = atom(async (get): Promise<UseResultJobType> => {
	const resultsName = get(resultNameAtom);
	if (resultsName.length === 0) return DefaultResultJobType;
	const controller = new AbortController();
	return await getRecipeCommon(resultsName, controller.signal)
		.then((res) => {
			const jobType = res.jobType;
			const enableDefect = isDefectInspection(jobType);

			return {
				jobType,
				enableDefect,
				enableDesign: hasDesign(res),
				enableBoxSegment: enableDefect,
				enableIntermediate: ["Trainable D2D", "C2C"].includes(jobType),
				hasReferences: jobType === "D2D",
			};
		})
		.catch((error) => {
			if (error.name !== "AbortError")
				console.error("getRecipeCommon fetch fail.", error);
			return DefaultResultJobType;
		});
});

/**
 * JobTypeから各種データ有無(Defect, Design, BoxSegment)を返す \
 * Defect: Trainable D2D, Trainable D2DB \
 * Design: Trainable D2DB, Matching, Camera \
 * BoxSegment: Trainable D2D, Trainable D2DB \
 * @returns 各種データ有無(Defect, Design, BoxSegment)
 */
export const useResultJobType = (): UseResultJobType => {
	return useAtomValue(resultJobTypeSelector);
};
