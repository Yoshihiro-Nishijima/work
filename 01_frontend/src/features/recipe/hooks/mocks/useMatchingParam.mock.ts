import { fn } from "@storybook/test";

import * as actual from "../useMatchingParam";
export * from "../useMatchingParam";
export const useMatchingParam = fn(actual.useMatchingParam).mockName(
	"useMatchingParam",
);
export const useSetMatchingParam = fn(actual.useSetMatchingParam).mockName(
	"useSetMatchingParam",
);
