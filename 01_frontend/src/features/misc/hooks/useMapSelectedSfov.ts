import { useSetSFovList } from "~/features/s-fov-list/hooks/useFovList";

import { useSelectedDefect } from "./useSelectedDefect";

interface UseMapSelectedSFov {
	updateSelectedSFov: (imageid: number) => void;
}

export const useMapSelectedSFov = (): UseMapSelectedSFov => {
	const { setSelectedDefect } = useSelectedDefect();
	const { setSelectedFovImageId } = useSetSFovList();

	// MapでsFOVを選択した場合に実行する処理
	const updateSelectedSFov = (imageid: number): void => {
		setSelectedFovImageId(imageid);
		setSelectedDefect(undefined); // sFOV選択時はdefect選択解除
	};
	return {
		updateSelectedSFov,
	};
};
