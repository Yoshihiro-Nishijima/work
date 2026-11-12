import { ky } from "~/lib/ky";

export async function postDatasetRun(
	datasetName: string,
	modelName?: string,
	signal?: AbortSignal,
): Promise<unknown> {
	const urlPrefix = modelName ? `adc/${modelName}` : "adc";
	return ky
		.post(`${urlPrefix}/datasets/${datasetName}/run`, {
			signal,
			// 30分以上かかる可能性があるためタイムアウト無効化
			timeout: false,
		})
		.json();
}
