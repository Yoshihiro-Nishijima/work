import { fn } from "@storybook/test";

import * as actual from "../useLoginedUser";
export * from "../useLoginedUser";
export const useLoginedUser = fn(actual.useLoginedUser).mockName(
	"useLoginedUser",
);
