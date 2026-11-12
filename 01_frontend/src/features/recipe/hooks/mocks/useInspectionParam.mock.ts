import { fn } from "@storybook/test";

import * as actual from "../useInspectionParam";
export * from "../useInspectionParam";
export const useInspectionParam = fn(actual.useInspectionParam).mockName(
	"useInspectionParam",
);
export const useSetInspectionParam = fn(actual.useSetInspectionParam).mockName(
	"useSetInspectionParam",
);
