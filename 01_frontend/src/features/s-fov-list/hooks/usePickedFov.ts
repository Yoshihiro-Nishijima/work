import { atom, useAtomValue, useSetAtom } from "jotai";
import { useCallback, useState } from "react";

import { selectedSFovImageIdSetReadAtom } from "~/features/misc/hooks/useSelectedSFovImageIdList";

import type { Fov } from "../types";
import { useFovList, useSetSFovList } from "./useFovList";

const pickedFovImageIdListAtom = atom<number[]>([]);

interface UsePickedFov {
	setPickedFovState: (selectedPicked: boolean) => void;
}

// Picked対象fovリスト取得(length=0の場合は、picked未実施。設定されているものがpicked対象fovリスト)
export const getPickedFovImageIdListAtom = atom((get) => {
	return get(pickedFovImageIdListAtom);
});

export const usePickedFov = (): UsePickedFov => {
	const [beforePickedFovList, setBeforePickedFovList] = useState<Fov[]>([]);
	const setPickedFovImageIdList = useSetAtom(pickedFovImageIdListAtom);
	const { fovList } = useFovList();
	const { setFovList } = useSetSFovList();
	const selectedSFovImageIdList = useAtomValue(selectedSFovImageIdSetReadAtom);

	const setPickedFovState = useCallback(
		(selectedPicked: boolean): void => {
			if (selectedPicked) {
				// Picked実施(現在のリストを退避し、picked後のリストに入れ替え)
				const newFovList = fovList.filter((fov) =>
					selectedSFovImageIdList.has(fov.imageid),
				);
				const pickedImageIdList = newFovList.map((fov) => fov.imageid);

				setBeforePickedFovList(fovList);
				setPickedFovImageIdList(pickedImageIdList);
				setFovList(newFovList);
			} else {
				// Picked解除(picked後のリストを破棄し、Picked前のリストに入れ替え)
				setFovList(beforePickedFovList);
				setPickedFovImageIdList([]);
				setBeforePickedFovList([]);
			}
		},
		[
			beforePickedFovList,
			fovList,
			setFovList,
			selectedSFovImageIdList,
			setPickedFovImageIdList,
		],
	);

	return {
		setPickedFovState,
	};
};
