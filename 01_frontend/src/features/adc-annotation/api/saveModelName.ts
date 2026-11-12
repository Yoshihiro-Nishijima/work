import { ky } from "lib/ky";

export const saveModelName = async (
	datasetName: string,
	modelName: string,
	signal: AbortSignal,
): Promise<unknown> => {
	const response = await ky.post(`adc/datasets/${datasetName}`, {
		json: { modelName },
		signal,
	});
	return await response.json();
};
