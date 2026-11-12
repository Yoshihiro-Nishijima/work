import { atom, useAtomValue } from "jotai";
import { useAtomCallback } from "jotai/utils";

import { getRecipeCommon } from "~/features/recipe/api";
import type { RecipeCommonParam } from "~/features/recipe/types";

const commonParamAtom = atom<RecipeCommonParam | undefined>(undefined);

export const useInitResultViewerCommonParam = (): ((
	resultName: string,
) => void) => {
	return useAtomCallback((_get, set, resultName) => {
		if (resultName.length === 0) return;
		const controller = new AbortController();
		getRecipeCommon(resultName, controller.signal)
			.then(async (res) => {
				set(commonParamAtom, res);
			})
			.catch((error) => {
				if (error.name === "AbortError") return;
				console.error("getRecipeCommon fetch fail.", error);
			});
		return () => {
			controller.abort();
		};
	});
};

interface UseResultViewerCommonParam {
	commonParam: RecipeCommonParam | undefined;
}
export const useResultViewerCommonParam = (): UseResultViewerCommonParam => {
	const commonParam = useAtomValue(commonParamAtom);
	return { commonParam };
};
