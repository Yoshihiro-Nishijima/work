import { ky } from "lib/ky";

import type { GetTrainingDetailParam } from "~/features/training-param-setting/types";

/** 選択中sfov取得 */
export const getSelectedFovListForTrainingModel = async (
	param: GetTrainingDetailParam,
	signal: AbortSignal,
): Promise<number[]> => {
	// TODO API は暫定
	return await ky
		.get(`trainings/${param.type}/${param.modelName}/selected-sfovs`, {
			signal,
		})
		.json<number[]>();
};
