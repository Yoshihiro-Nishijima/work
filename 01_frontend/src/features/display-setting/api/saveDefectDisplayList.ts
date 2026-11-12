import { ky } from "lib/ky";

import type { DefectDisplay } from "../types";

export const saveDefectDisplayList = async (
	signal: AbortSignal,
	param: DefectDisplay[],
): Promise<unknown> => {
	return await ky
		.put("config/defect-display", { json: param, signal })
		.json<DefectDisplay[]>();
};
