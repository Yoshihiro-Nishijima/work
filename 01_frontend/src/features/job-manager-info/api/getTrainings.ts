import { ky } from "lib/ky";

import type {
	SearchParam,
	SearchResults,
	TrainableDataParam,
	TrainableModelData,
} from "../types";

/** type別のTrainingキュー一覧取得 */
const getTrainings =
	(type: "D2D" | "D2DB") =>
	async (
		param: SearchParam,
		signal: AbortSignal,
	): Promise<SearchResults<TrainableModelData>> => {
		// TODO API は暫定
		return await ky
			.post(`trainings/models/${type}/search`, {
				json: param,
				signal,
			})
			.json<{ total: number; trainings: TrainableModelData[] }>()
			.then((res) => {
				return {
					total: res.total,
					results: res.trainings,
				} satisfies SearchResults<TrainableModelData>;
			});
	};

export const getD2DTrainings = getTrainings("D2D");
export const getD2DBTrainings = getTrainings("D2DB");

export const getTrainingsFetch = (
	typeParam: TrainableDataParam,
): ((
	param: SearchParam,
	signal: AbortSignal,
) => Promise<SearchResults<TrainableModelData>>) => {
	// type別のTrainingキュー一覧取得切り替え関数
	switch (typeParam.type) {
		case "D2D":
			return getD2DTrainings;
		case "D2DB":
			return getD2DBTrainings;
	}
};
