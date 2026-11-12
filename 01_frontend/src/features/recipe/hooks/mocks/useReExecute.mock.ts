import { fn } from "@storybook/test";

import * as actual from "../useReExecute";
export * from "../useReExecute";
export const useReExecute = fn(actual.useReExecute).mockName("useReExecute");
