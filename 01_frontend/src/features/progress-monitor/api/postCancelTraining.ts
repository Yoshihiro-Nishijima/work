import { ky } from "lib/ky";

import type { CancelTrainingParam, CancelTrainingResponse } from "../types";

export const postCancelTraining = async (
	param: CancelTrainingParam,
	signal: AbortSignal,
): Promise<CancelTrainingResponse> => {
	return await ky
		.post(`trainings/${param.id}/cancel`, { signal })
		.json<CancelTrainingResponse>();
};
