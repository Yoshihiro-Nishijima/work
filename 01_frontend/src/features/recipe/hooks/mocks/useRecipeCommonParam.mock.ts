import { fn } from "@storybook/test";

import * as actual from "../useRecipeCommonParam";
export * from "../useRecipeCommonParam";
export const useRecipeCommonParams = fn(actual.useRecipeCommonParams).mockName(
	"useRecipeCommonParams",
);
export const useJobType = fn(actual.useJobType).mockName("useJobType");
