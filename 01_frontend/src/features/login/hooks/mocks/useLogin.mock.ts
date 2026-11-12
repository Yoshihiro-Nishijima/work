import { fn } from "@storybook/test";

import * as actual from "../useLogin";
export * from "../useLogin";
export const useLogin = fn(actual.useLogin).mockName("useLogin");
export const useLoginSuccess = fn(actual.useLoginSuccess).mockName(
	"useLoginSuccess",
);
