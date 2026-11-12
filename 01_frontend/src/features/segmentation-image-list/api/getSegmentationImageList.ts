import { ky } from "lib/ky";

export const getSegmentationImageList = async (
	modelName: string,
	signal: AbortSignal,
): Promise<string[]> => {
	return await ky
		.get(`models/${modelName}/segmentation-image-list`, { signal })
		.json<string[]>();
};
