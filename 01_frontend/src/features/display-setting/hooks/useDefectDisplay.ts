import { atom, useAtom } from "jotai";
import { useEffect, useMemo } from "react";

import { createFormatCaughtBy } from "~/features/defect-list/utils/defectFormatters";
import { getDefectDisplayList } from "../api/getDefectDisplayList";
import type { DefectDisplayRow } from "../types";

export const DEFECT_DISPLAY_NUM = 8;

// 選択中DefectDisplay
export const selectedDefectDisplayNoAtom = atom(0);

const DEFAULT_DEFECT_DISPLAY = {
	name: "Filter",
	color: "#000000",
};

const defectDisplayRowListAtom = atom<DefectDisplayRow[]>(
	[...Array(DEFECT_DISPLAY_NUM)].map((_, i) => {
		return {
			...DEFAULT_DEFECT_DISPLAY,
			filterNo: i + 1,
		};
	}),
);

interface UseDefectDisplay {
	defectDisplayRowList: DefectDisplayRow[];
	selectedDefectDisplayNo: number;
	setSelectedDefectDisplayNo: (selectedDefectDisplayNo: number) => void;
	formatCaughtBy: (caughtBy: number | null | undefined) => string;
}

export const useDefectDisplay = (): UseDefectDisplay => {
	const [defectDisplayRowList, setDefectDisplayRowList] = useAtom(
		defectDisplayRowListAtom,
	);
	const [selectedDefectDisplayNo, setSelectedDefectDisplayNo] = useAtom(
		selectedDefectDisplayNoAtom,
	);

	useEffect(() => {
		const controller = new AbortController();
		getDefectDisplayList(controller.signal)
			.then((res) => {
				setDefectDisplayRowList(
					[...Array(DEFECT_DISPLAY_NUM)].map((_, i) => {
						return res.length > i
							? { ...res[i], filterNo: i + 1 }
							: { ...DEFAULT_DEFECT_DISPLAY, filterNo: i + 1 };
					}),
				);
			})
			.catch((error) => {
				if (error.name === "AbortError") return;
				console.error("getDefectDisplayList fetch fail.", error);
			});
		return () => {
			controller.abort();
		};
	}, [setDefectDisplayRowList]);

	/**
	 * caughtByの値をDefectDisplay名に変換
	 * @param caughtBy caughtByの値(1始まりのindex)
	 * @returns DefectDisplay名(見つからない場合は空文字)
	 */
	const formatCaughtBy = useMemo(
		() => createFormatCaughtBy(defectDisplayRowList),
		[defectDisplayRowList],
	);

	return {
		defectDisplayRowList,
		selectedDefectDisplayNo,
		setSelectedDefectDisplayNo,
		formatCaughtBy,
	};
};
