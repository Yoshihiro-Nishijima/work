import { fn } from "@storybook/test";

import * as actual from "../useCorrectionParam";
export * from "../useCorrectionParam";
export const useCorrectionParam = fn(actual.useCorrectionParam).mockName(
	"useCorrectionParam",
);
export const useSetCorrectionParam = fn(actual.useSetCorrectionParam).mockName(
	"useSetCorrectionParam",
);
