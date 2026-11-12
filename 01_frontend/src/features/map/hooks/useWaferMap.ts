import type { Point } from "pixi.js";

import { IS_CHIP_EXIST } from "~/config";
import { useSetSelectedChip } from "~/features/misc/hooks/useMapSelectionStatus";
import { useIdw } from "./useIdw";

interface UseWaferMap {
	updateSelectedChip: (coord: Point) => void;
}

/** WaferMap付帯情報用の状態管理 */
export const useWaferMap = (): UseWaferMap => {
	const setSelectedChip = useSetSelectedChip();
	const { idw, toIdwChipIndex } = useIdw();

	const updateSelectedChip = (coord: Point): void => {
		// 選択Chipの描画座標をIDW座標で更新
		if (idw == null) return;
		if (idw.chipArray.x <= coord.x || idw.chipArray.y <= coord.y) return;
		// 存在するチップだった場合のみ更新
		if (idw.chipExist[coord.y].charAt(coord.x) === IS_CHIP_EXIST) {
			setSelectedChip(toIdwChipIndex(coord));
		}
	};

	return { updateSelectedChip };
};
