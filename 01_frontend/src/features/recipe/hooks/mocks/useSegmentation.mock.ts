import { fn } from "@storybook/test";

import * as actual from "../useSegmentation";
export * from "../useSegmentation";
export const useSegmentation = fn(actual.useSegmentation).mockName(
	"useSegmentation",
);
