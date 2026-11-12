import { ky } from "lib/ky";

import type { Fov } from "../types";

export const getFov = async (
	target: string,
	query: string,
	signal: AbortSignal,
): Promise<{ total: number; fovs: Fov[] }> => {
	return await ky
		.get(`results/${target}/fovs?${query}`, { signal, timeout: false })
		.json<{ total: number; fovs: Fov[] }>();
};
