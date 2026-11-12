import { ky } from "lib/ky";

import type { TrainingModelDeleteParam } from "../types";

export const deleteTrainingModel = async (
	param: TrainingModelDeleteParam,
	signal: AbortSignal,
): Promise<unknown> => {
	return await ky
		.delete(`trainings/${param.trainingType}/${param.modelName}`, { signal })
		.json();
};
