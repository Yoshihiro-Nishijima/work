import { ky } from "lib/ky";

export const postTestRunInit = async (
	resultName: string,
	mFovNo: number,
	sFovNo: number,
	signal: AbortSignal,
): Promise<string> => {
	return await ky
		.post(`test-run/${resultName}/${mFovNo}-${sFovNo}`, { signal })
		.text();
};
