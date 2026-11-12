import { fn } from "@storybook/test";

import * as actual from "../useAreaNos";
export * from "../useAreaNos";
export const useAreaNos = fn(actual.useAreaNos).mockName("useAreaNos");
