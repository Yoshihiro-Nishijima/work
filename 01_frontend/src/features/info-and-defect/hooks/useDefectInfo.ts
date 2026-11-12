import { atom, useAtom } from "jotai";
import { useCallback, useEffect } from "react";

import {
	useMfovnoForSEMImage,
	useSfovnoForSEMImage,
} from "~/features/map/hooks";
import { useResultName } from "~/features/misc/hooks/useResultName";
import { useTestRunState } from "~/features/recipe/hooks";

import type { StyledTableInfo } from "~/components/elements";
import { getImagesDefectInfo } from "../api/getImagesDefectInfo";
import { getTestRunDefectInfo } from "../api/getTestRunDefectInfo";
import type { DefectGetParam } from "../types";

const defectInfoTableAtom = atom<StyledTableInfo[]>([]);

export const useImagesDefectInfo = (): {
	defectInfoTable: StyledTableInfo[];
} => {
	const [defectInfoTable, setDefectInfoTable] = useAtom(defectInfoTableAtom);
	const { resultName } = useResultName();
	const { mfovnoForSEMImage } = useMfovnoForSEMImage();
	const { sfovnoForSEMImage } = useSfovnoForSEMImage();
	useEffect(() => {
		if (resultName.length === 0) return;
		if (!mfovnoForSEMImage || !sfovnoForSEMImage) {
			return;
		}
		const controller = new AbortController();
		const param: DefectGetParam = {
			target: resultName,
			mfovNo: mfovnoForSEMImage,
			sfovNo: sfovnoForSEMImage,
		};
		getImagesDefectInfo(param, controller.signal)
			.then((res) => {
				if (res != null) {
					setDefectInfoTable(
						res.map((dataInfo) => ({
							item: dataInfo.column,
							value: dataInfo.data,
						})),
					);
				}
			})
			.catch((error) => {
				if (error.name === "AbortError") return;
				console.error("getImagesDefectInfo fetch fail.", error);
			});
		return () => {
			controller.abort();
		};
	}, [mfovnoForSEMImage, resultName, setDefectInfoTable, sfovnoForSEMImage]);
	return {
		defectInfoTable,
	};
};

interface UseTestRunDefectInfo {
	defectInfoTable: StyledTableInfo[];
	updateTestRunDefectInfoTable: () => void;
}

export const useTestRunDefectInfo = (): UseTestRunDefectInfo => {
	const [defectInfoTable, setDefectInfoTable] = useAtom(defectInfoTableAtom);
	const { resultName } = useResultName();
	const { mfovnoForSEMImage } = useMfovnoForSEMImage();
	const { sfovnoForSEMImage } = useSfovnoForSEMImage();
	const { testRunId } = useTestRunState();

	const updateTestRunDefectInfoTable = useCallback(() => {
		if (resultName.length === 0) return;
		if (!mfovnoForSEMImage || !sfovnoForSEMImage) {
			return;
		}
		const controller = new AbortController();
		const param: DefectGetParam = {
			target: resultName,
			mfovNo: mfovnoForSEMImage,
			sfovNo: sfovnoForSEMImage,
		};
		getTestRunDefectInfo(param.target, testRunId, controller.signal)
			.then((res) => {
				res != null &&
					setDefectInfoTable(
						res.map((dataInfo) => ({
							item: dataInfo.column,
							value: dataInfo.data,
						})),
					);
			})
			.catch((error) => {
				if (error.name === "AbortError") return;
				console.error("getTestRunDefectInfo fetch fail.", error);
			});
		return () => {
			controller.abort();
		};
	}, [
		mfovnoForSEMImage,
		resultName,
		setDefectInfoTable,
		sfovnoForSEMImage,
		testRunId,
	]);
	return {
		defectInfoTable,
		updateTestRunDefectInfoTable,
	};
};
