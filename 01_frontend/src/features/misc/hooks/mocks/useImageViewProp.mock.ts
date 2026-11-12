import { fn } from "@storybook/test";

import * as actual from "../useImageViewProp";

export * from "../useImageViewProp";
export const useImageViewProp = fn(actual.useImageViewProp).mockName(
	"useImageViewProp",
);
export const useShowImage = fn(actual.useShowImage).mockName("useShowImage");
