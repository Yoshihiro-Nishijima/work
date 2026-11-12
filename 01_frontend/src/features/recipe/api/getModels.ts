import { ky } from "lib/ky";

export const getModels = async (
	type: "Trainable D2DB" | "Trainable D2D",
	signal: AbortSignal,
): Promise<string[]> => {
	return await ky
		.get(`models/${type.endsWith("D2D") ? "d2d" : "d2db"}`, { signal })
		.json<string[]>();
};
