import { ky } from "lib/ky";
import { DOMAIN_API } from "~/config";
import type { GetCareAreaParam } from "../type";

/**
 * CareAreaファイル取得
 * @param param resultNameを使用
 * @param signal Abort用signal
 * @return arrow形式ファイル
 */
export const getCareAreaFile = async (
	param: GetCareAreaParam,
	signal: AbortSignal,
): Promise<ArrayBuffer> => {
	// TODO API は暫定
	return await ky
		.get(`results/${param.resultName}/targets.arrow`, {
			prefixUrl: DOMAIN_API,
			signal,
		})
		.arrayBuffer();
};
