import { fn } from "@storybook/test";

import * as actual from "../useReTestRun";
export * from "../useReTestRun";
export const useReTestRun = fn(actual.useReTestRun).mockName("useReTestRun");
