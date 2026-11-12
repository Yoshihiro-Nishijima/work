import { ky } from "lib/ky";

import type { GetTrainingDetailParam, TrainingDetail } from "../types";

/** Training詳細取得取得 */
export const getTrainingDetail = async (
	param: GetTrainingDetailParam,
	signal: AbortSignal,
): Promise<TrainingDetail> => {
	// TODO API は暫定
	return await ky
		.get(`trainings/${param.type}/${param.modelName}`, { signal })
		.json<TrainingDetail>();
};
