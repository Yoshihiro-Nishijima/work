import { ky } from "lib/ky";

import type { ExecuteTrainingParam, ExecuteTrainingResponse } from "../type";

/** TrainingQueuingに追加 */
export const addTrainingJob = async (
	param: ExecuteTrainingParam,
	signal: AbortSignal,
): Promise<ExecuteTrainingResponse> => {
	// TODO API は暫定
	return await ky
		.post(`trainings/${param.trainingType}/${param.modelName}`, {
			json: param,
			signal,
		})
		.json<ExecuteTrainingResponse>();
};
