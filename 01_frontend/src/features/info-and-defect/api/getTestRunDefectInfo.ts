import { ky } from "lib/ky";

import type { InfoTable } from "~/features/misc/types";

export const getTestRunDefectInfo = async (
	target: string,
	id: string,
	signal: AbortSignal,
): Promise<InfoTable[]> => {
	return await ky
		.get(`test-run/${target}/${id}/summary`, { signal })
		.json<InfoTable[]>();
};
