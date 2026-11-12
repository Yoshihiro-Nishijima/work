import { ky } from "lib/ky";

import type { modeFov } from "../types";

interface GetFovInfoParam {
	resultName: string;
	mFovNo: number;
	sFovNo: number;
}

export const getFovInfo = async (
	param: GetFovInfoParam,
	signal: AbortSignal,
): Promise<modeFov> => {
	return await ky
		.get(`results/${param.resultName}/fovs/${param.mFovNo}/${param.sFovNo}`, {
			signal,
		})
		.json<modeFov>();
};
