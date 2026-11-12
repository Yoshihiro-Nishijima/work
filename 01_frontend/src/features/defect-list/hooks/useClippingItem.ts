import { atom, useAtom } from "jotai";
import { useEffect } from "react";

import { useDefect } from "~/features/defect-list/hooks/useDefect";
import { useSelectedDefect } from "~/features/misc/hooks/useSelectedDefect";
import type { FixedImgDataType } from "../types";
import { useFixedSizeGridProp } from "./useFixedSizeGridProp";

/* capture-rate-calculator画面のソート順（order） */
const useClippingItemAtom = atom<FixedImgDataType[][]>([]);

export interface UseClippingItem {
	clippingItem: FixedImgDataType[][];
}

export const useClippingItem = (): UseClippingItem => {
	const [clippingItem, setClippingItem] = useAtom(useClippingItemAtom);

	const { defectList } = useDefect();
	const { selectedDefect } = useSelectedDefect();
	const { columnCount } = useFixedSizeGridProp();

	useEffect(() => {
		const mockData: FixedImgDataType[] = [];
		const newImgList: FixedImgDataType[][] = [];
		defectList.forEach((data, idx) => {
			mockData.push({
				id: data.defectId,
				img: data.src,
				coordX: data.coordX,
				coordY: data.coordY,
				abnormality: data.abnormality,
				mFOVNo: data.mFOVno,
				sFOVNo: data.sFOVno,
				selectmode: 0,
				imgborder: 5,
				imgbordercolor:
					data.defectId === selectedDefect?.defectId ? "blue" : "silver",
				chipX: data.chipX,
				chipY: data.chipY,
				No: idx,
			});
			if ((idx + 1) % columnCount === 0) {
				newImgList.push([...mockData]);
				mockData.length = 0;
			}
		});
		if (mockData.length !== 0) {
			newImgList.push([...mockData]);
		}
		setClippingItem(newImgList);
	}, [columnCount, setClippingItem, defectList, selectedDefect?.defectId]);

	return { clippingItem };
};
