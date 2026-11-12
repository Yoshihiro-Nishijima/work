import { ky } from "lib/ky";

import type { DefectDisplay } from "../types";

export const getDefectDisplayList = async (
	signal: AbortSignal,
): Promise<DefectDisplay[]> => {
	return await ky
		.get("config/defect-display", { signal })
		.json<DefectDisplay[]>();
};
