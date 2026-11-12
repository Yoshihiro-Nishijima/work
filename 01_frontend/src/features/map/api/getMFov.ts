import { ky } from "lib/ky";

import type { GetMFovParam, MFov } from "../types";

export const getMFov = async (
	param: GetMFovParam,
	signal: AbortSignal,
): Promise<MFov[]> => {
	return await ky
		.get(
			`results/${param.resultName}/mfovs/chipx=${param.chipIndex.x};chipy=${param.chipIndex.y}`,
			{ signal },
		)
		.json<MFov[]>();
};
