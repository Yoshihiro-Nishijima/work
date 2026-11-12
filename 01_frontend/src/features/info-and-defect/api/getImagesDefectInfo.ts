import { ky } from "lib/ky";

import type { InfoTable } from "~/features/misc/types";

import type { DefectGetParam } from "../types";

export const getImagesDefectInfo = async (
	param: DefectGetParam,
	signal: AbortSignal,
): Promise<InfoTable[]> => {
	return await ky
		.get(
			`results/${param.target}/fovs/${param.mfovNo}/${param.sfovNo}/summary`,
			{ signal },
		)
		.json<InfoTable[]>();
};
