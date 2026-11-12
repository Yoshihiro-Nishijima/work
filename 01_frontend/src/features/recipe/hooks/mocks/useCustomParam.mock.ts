import { fn } from "@storybook/test";

import * as actual from "../useCustomParam";
export * from "../useCustomParam";
export const useCustomParam = fn(actual.useCustomParam).mockName(
	"useCustomParam",
);
