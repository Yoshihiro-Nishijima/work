import { useEffect, useState } from "react";

import { useMapSelectionStatus } from "~/features/misc/hooks/useMapSelectionStatus";
import { useResultName } from "~/features/misc/hooks/useResultName";

import { getMFov } from "../api/getMFov";
import type { GetMFovParam, MFov } from "../types";

interface UseMFov {
	mFovList: MFov[];
	findMFov: (mfovNo: number | undefined) => MFov | undefined;
}

export const useMFov = (): UseMFov => {
	const [mFovList, setMFovList] = useState<MFov[]>([]);
	const { resultName } = useResultName();
	const { selectedChipIndex } = useMapSelectionStatus();

	const findMFov = (mfovNo: number | undefined): MFov | undefined => {
		const findMFov = mFovList.find((mfov) => {
			return mfov.mfovNo === mfovNo;
		});
		return findMFov;
	};

	useEffect(() => {
		if (resultName.length === 0) return;
		const param: GetMFovParam = {
			resultName,
			chipIndex: selectedChipIndex,
		};
		const controller = new AbortController();
		getMFov(param, controller.signal)
			.then((res) => {
				setMFovList(res);
			})
			.catch((error) => {
				if (error.name === "AbortError") return;
				console.error("getMFov fetch fail.", error);
			});
		return () => {
			controller.abort();
		};
	}, [resultName, selectedChipIndex]);

	return { mFovList, findMFov };
};
