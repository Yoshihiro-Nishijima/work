import type { RecipeCommonParam, RecipeModeParam } from ".";

export interface ReExecuteParam {
	common: RecipeCommonParam;
	modes: Array<{
		no: number;
		mode: RecipeModeParam;
	}>;
}
