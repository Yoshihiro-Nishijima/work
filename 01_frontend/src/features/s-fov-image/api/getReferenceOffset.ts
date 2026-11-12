import { ky } from "lib/ky";

interface GetReferenceOffsetParam {
	resultName: string;
	mfovNo: number;
	sfovNo: number;
	refType: "ref1" | "ref2";
	testRunId?: string;
	testRunProcessedCount?: number;
}

interface ReferenceOffset {
	x: number;
	y: number;
}

/** 画像の表示位置合わせ用オフセット取得 */
export const getReferenceOffset = async (
	{
		resultName,
		mfovNo,
		sfovNo,
		refType,
		testRunId,
		testRunProcessedCount,
	}: GetReferenceOffsetParam,
	signal: AbortSignal,
): Promise<ReferenceOffset> => {
	if (testRunId && testRunProcessedCount) {
		// TestRun実行時のオフセット取得
		return await ky
			.get(`test-run/${resultName}/${testRunId}/${refType}/offset`, {
				signal,
			})
			.json<ReferenceOffset>();
	}
	return await ky
		.get(`results/${resultName}/${mfovNo}/${sfovNo}/${refType}/offset`, {
			signal,
		})
		.json<ReferenceOffset>();
};
