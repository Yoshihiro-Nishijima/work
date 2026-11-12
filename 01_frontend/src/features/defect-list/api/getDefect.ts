import { ky } from "lib/ky";

import type { DefectRecord } from "~/features/defect-list/types";

/**
 * Defectリスト取得API呼び出し結果取得
 * @param resultName Result名
 * @param query ページネーション、ソート、フィルタ指定
 * @param signal Abort用signal
 * @returns Defectリスト
 */
export const getDefect = async (
	resultName: string,
	query: string,
	signal: AbortSignal,
): Promise<{ total: number; defects: DefectRecord[] }> => {
	return await ky
		.get(`results/${resultName}/defects?${query}`, { signal, timeout: false })
		.json<{ total: number; defects: DefectRecord[] }>();
};
