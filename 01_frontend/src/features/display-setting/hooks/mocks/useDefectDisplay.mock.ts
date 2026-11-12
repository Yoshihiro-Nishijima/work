import { fn } from "@storybook/test";

import * as actual from "../useDefectDisplay";
export * from "../useDefectDisplay";
export const useDefectDisplay = fn(actual.useDefectDisplay).mockName(
	"useDefectDisplay",
);
