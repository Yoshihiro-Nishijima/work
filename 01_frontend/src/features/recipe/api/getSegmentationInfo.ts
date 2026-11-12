import { ky } from "lib/ky";

import type { SegmentationInfo } from "../types/Inspection";

export const getSegmentationInfo = async (
	modelName: string,
	signal: AbortSignal,
): Promise<SegmentationInfo> => {
	return await ky
		.get(`models/${modelName}/segmentation-info`, { signal })
		.json<SegmentationInfo>();
};
