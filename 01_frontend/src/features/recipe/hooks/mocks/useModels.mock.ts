import { fn } from "@storybook/test";

import * as actual from "../useModels";

export * from "../useModels";

export const useModels = fn(actual.useModels).mockName("useModels");
