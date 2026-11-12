import { ky } from "lib/ky";

import type { ReUploadParam } from "../types";

export const reupload = async (
	param: ReUploadParam,
	signal: AbortSignal,
): Promise<string> => {
	const { resultName, index } = param;
	return await ky
		.post(`results/${resultName}/re-upload/${index}`, { signal })
		.text()
		.then((res) => {
			return res;
		})
		.catch((e) => {
			return e.toString();
		});
};
