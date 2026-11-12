import { ky } from "lib/ky";

import type { Area } from "~/features/recipe/types";

import type { ImageInfo } from "../types";

export const getImageInfo = async (
	target: string,
	signal: AbortSignal,
): Promise<{ total: number; imageInfo: ImageInfo[] }> => {
	const areas = await ky
		.get(`results/${target}/areas`, { signal })
		.json<Area[]>();

	if (areas.length === 0) {
		return { total: 0, imageInfo: [] };
	}

	const { fovWidth, fovHeight } = areas[0];

	return {
		total: 1,
		imageInfo: [
			{ item: "Width", value: fovWidth },
			{ item: "Height", value: fovHeight },
		],
	};
};
