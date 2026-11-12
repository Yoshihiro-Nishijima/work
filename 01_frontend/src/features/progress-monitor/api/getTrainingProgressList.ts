import { ky } from "lib/ky";

import type {
	SearchParam,
	SearchResults,
} from "~/features/job-manager-info/types";
import type { TrainingProgressInfo } from "../types";

export const getTrainingProgressList = async (
	param: SearchParam,
	signal: AbortSignal,
): Promise<SearchResults<TrainingProgressInfo>> => {
	return await ky
		.post("trainings/job/search", {
			json: param,
			signal,
		})
		.json<{ total: number; results: TrainingProgressInfo[] }>()
		.then((res) => {
			return {
				total: res.total,
				results: res.results,
			} satisfies SearchResults<TrainingProgressInfo>;
		});
};
