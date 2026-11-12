import { useEffect, useState } from "react";
import type { showSEMType } from "~/features/misc/hooks/useImageViewProp";
import { getReferenceOffset } from "../api/getReferenceOffset";

const REFERENCE_OFFSET_NOT_FOUND_MESSAGE = "Not Found the Reference Offset.";

interface UseReferenceOffset {
	offsetX: number;
	offsetY: number;
	errMsg?: string;
}
export const useReferenceOffset = (
	resultName: string,
	mfovNo: number,
	sfovNo: number,
	semType: showSEMType,
	testRunId?: string,
	testRunProcessedCount?: number,
): UseReferenceOffset => {
	const [offset, setOffset] = useState<{ x: number; y: number }>({
		x: 0,
		y: 0,
	});
	const [errMsg, setErrMsg] = useState("");

	useEffect(() => {
		if (semType === "target") {
			setOffset({ x: 0, y: 0 });
			return;
		}
		const controller = new AbortController();
		getReferenceOffset(
			{
				resultName,
				mfovNo,
				sfovNo,
				refType: semType,
				testRunId,
				testRunProcessedCount,
			},
			controller.signal,
		)
			.then((res) => {
				setOffset({ x: res.x, y: res.y });
				setErrMsg("");
			})
			.catch((error) => {
				if (error.name === "AbortError") return;
				setErrMsg(REFERENCE_OFFSET_NOT_FOUND_MESSAGE);
			});
		return () => {
			controller.abort();
		};
	}, [resultName, mfovNo, sfovNo, semType, testRunId, testRunProcessedCount]);

	return {
		offsetX: offset.x,
		offsetY: offset.y,
		errMsg,
	};
};
