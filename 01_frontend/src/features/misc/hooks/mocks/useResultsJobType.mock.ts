import { fn } from "@storybook/test";

import * as actual from "../useResultsJobType";

export * from "../useResultsJobType";

export const useResultJobType = fn(actual.useResultJobType).mockName(
	"useResultJobType",
);
