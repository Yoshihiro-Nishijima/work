import { fn } from "@storybook/test";

import * as actual from "../useImportedParam";
export * from "../useImportedParam";
export const useImportedParam = fn(actual.useImportedParam).mockName(
	"useImportedParam",
);
export const useDesignDataList = fn(actual.useDesignDataList).mockName(
	"useDesignDataList",
);
