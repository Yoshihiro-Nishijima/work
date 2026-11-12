import { ky } from "lib/ky";

import type { DatasetDefect } from "~/features/adc-annotation/types";
import type {
	SearchParam,
	SearchResults,
} from "~/features/job-manager-info/types";

/**
 * DatasetDefect取得API呼び出し結果取得
 * @param datasetName Dataset名
 * @param param ページネーション、ソート、フィルタ指定
 * @param signal Abort用signal
 * @returns DatasetDefect
 */
export async function getDatasetDefect(
	datasetType: string,
	datasetName: string,
	param: SearchParam,
	signal?: AbortSignal,
): Promise<SearchResults<DatasetDefect>> {
	return await ky
		.post(`datasets/${datasetType}/${datasetName}/defects/search`, {
			json: param,
			signal,
		})
		.json<{ total: number; results: DatasetDefect[] }>();
}
