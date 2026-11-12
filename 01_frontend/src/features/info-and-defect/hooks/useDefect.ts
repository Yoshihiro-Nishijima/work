import { atom, useAtom } from "jotai";
import {
	type Dispatch,
	type SetStateAction,
	useCallback,
	useState,
} from "react";

import type { DefectRecord } from "~/features/defect-list/types";
import {
	useMfovnoForSEMImage,
	useSfovnoForSEMImage,
} from "~/features/map/hooks";
import { useResultName } from "~/features/misc/hooks/useResultName";
import { useTestRunState } from "~/features/recipe/hooks";

import { Point } from "pixi.js";
import { getDefect } from "../api/getDefect";
import { getTestRunDefect } from "../api/getTestRunDefect";
import type { DefectGetParam } from "../types";

const selectedDefectAtom = atom<DefectRecord | undefined>(undefined);

const defectListAtom = atom<DefectRecord[]>([]);

const filteredDefectsAtom = atom<DefectRecord[]>([]);

interface UseDefect {
	total: number;
	defectList: DefectRecord[];
	selectedDefect: DefectRecord | undefined;
	filteredDefects: DefectRecord[];
	setSelectedDefect: Dispatch<SetStateAction<DefectRecord | undefined>>;
	setFilteredDefects: (filteredDefects: DefectRecord[]) => void;
	updateTestRunDefect: () => void;
	setDefect: () => void;
}

export function calcDefectCenterPoint(defect: DefectRecord): Point {
	// Defectの中心位置から、矩形サイズの半分を減算することで矩形のtop-leftを求める
	return new Point(
		defect.topLeftX + Math.abs(defect.bottomRightX - defect.topLeftX) / 2,
		defect.topLeftY + Math.abs(defect.bottomRightY - defect.topLeftY) / 2,
	);
}

export const useDefect = (): UseDefect => {
	const [defectList, setDefectList] = useAtom(defectListAtom);
	const [total, setTotal] = useState(0);
	const [selectedDefect, setSelectedDefect] = useAtom(selectedDefectAtom);
	const [filteredDefects, setFilteredDefects] = useAtom(filteredDefectsAtom);
	const { resultName } = useResultName();
	const { mfovnoForSEMImage } = useMfovnoForSEMImage();
	const { sfovnoForSEMImage } = useSfovnoForSEMImage();
	const [useTestRunDefects, setUseTestRunDefects] = useState(false);
	const { testRunId } = useTestRunState();

	const updateTestRunDefect = useCallback(() => {
		if (resultName.length === 0) return;
		if (
			mfovnoForSEMImage == null ||
			sfovnoForSEMImage == null ||
			mfovnoForSEMImage === 0 ||
			sfovnoForSEMImage === 0
		) {
			return;
		}
		const controller = new AbortController();
		const param: DefectGetParam = {
			target: resultName,
			mfovNo: mfovnoForSEMImage,
			sfovNo: sfovnoForSEMImage,
		};
		setUseTestRunDefects(true);
		if (testRunId == null || testRunId === "") return;
		getTestRunDefect(
			{ resultName: param.target, id: testRunId },
			controller.signal,
		)
			.then((res) => {
				res.total != null && setTotal(res.total);
				res.defects != null && setDefectList(res.defects);
			})
			.catch((error) => {
				if (error.name === "AbortError") return;
				console.error("getTestRunDefect fetch fail.", error);
			});
		return () => {
			controller.abort();
		};
	}, [
		mfovnoForSEMImage,
		resultName,
		setDefectList,
		sfovnoForSEMImage,
		testRunId,
	]);

	const setDefect = useCallback(() => {
		if (useTestRunDefects) return;
		if (resultName.length === 0) return;

		if (mfovnoForSEMImage == null || mfovnoForSEMImage === 0) return;
		if (sfovnoForSEMImage == null || sfovnoForSEMImage === 0) return;

		const controller = new AbortController();
		const param: DefectGetParam = {
			target: resultName,
			mfovNo: mfovnoForSEMImage,
			sfovNo: sfovnoForSEMImage,
		};
		getDefect(param, controller.signal)
			.then((res) => {
				res.total != null && setTotal(res.total);
				res.defects != null && setDefectList(res.defects);
			})
			.catch((error) => {
				if (error.name === "AbortError") return;
				console.error("getDefect fetch fail.", error);
			});
		return () => {
			controller.abort();
		};
	}, [
		resultName,
		setDefectList,
		useTestRunDefects,
		mfovnoForSEMImage,
		sfovnoForSEMImage,
	]);

	return {
		defectList,
		total,
		selectedDefect,
		filteredDefects,
		setSelectedDefect,
		setFilteredDefects,
		updateTestRunDefect,
		setDefect,
	};
};
