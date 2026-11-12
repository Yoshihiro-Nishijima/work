import { ky } from "lib/ky";

import type { RangedDefectInfo, RangedDefectsInfoGetParam } from "../types";

/** 指定座標範囲の欠陥点およびグループ情報を取得 */
export const getRangedDefectsInfo = async (
	param: RangedDefectsInfoGetParam,
	signal: AbortSignal,
): Promise<RangedDefectInfo[]> => {
	const query = [
		param.rank != null ? `rank=${param.rank}` : "",
		param.filterQuery,
	]
		.filter((s) => s != null)
		.join("&");
	return await ky
		.get(
			`results/${param.resultName}/chipX=${param.chipX};chipY=${param.chipY};` +
				`minCoordX=${param.minCoordX};maxCoordX=${param.maxCoordX};minCoordY=${param.minCoordY};maxCoordY=${param.maxCoordY}?${query}`,
			{
				signal,
				timeout: 6_000,
			},
		)
		.json<RangedDefectInfo[]>();
};
