import { atom, useAtom } from "jotai";
import { Point } from "pixi.js";
import { useCallback, useEffect } from "react";

import { useIdw } from "~/features/map/hooks";
import { useSelectedDefect } from "~/features/misc/hooks/useSelectedDefect";
import { useFovList } from "~/features/s-fov-list/hooks/useFovList";

/* ChipMap領域の縦横の最大幅 */
export const CHIPMAP_AREA_WIDTH = 200;
export const CHIPMAP_AREA_HEIGHT = 200;

/* Map表示領域の座標(初期値) */
export const DEFAULT_MAP_RANGE_TOP_LEFT_POINT = new Point(0, 0);

/* 選択中sFOV/Defectを含む短径エリア表示領域の縦横の最大幅 */
export const SELECTED_DISPLAY_AREA_WIDTH = 10;
export const SELECTED_DISPLAY_AREA_HEIGHT = 10;

/* Map表示領域を出したくない場合は、Top-Left、Bottom-Rightの座標は(0,0)を設定すること */
/* Map表示領域 Top-Leftの座標 */
const displayedMapTopLeftWorldPointAtom = atom(
	DEFAULT_MAP_RANGE_TOP_LEFT_POINT,
);

interface UseSelectedDisplayArea {
	displayedMapTopLeftWorldPoint: Point;
}

/* ChipMapエリアに選択中sFOV/Defectを含む短径エリアを表示するための左上点算出 */
export const useSelectedDisplayArea = (): UseSelectedDisplayArea => {
	const [displayedMapTopLeftWorldPoint, setDisplayedMapTopLeftWorldPoint] =
		useAtom(displayedMapTopLeftWorldPointAtom);

	const { idw } = useIdw();
	const { selectedFov } = useFovList();
	const { selectedDefect } = useSelectedDefect();

	const calcWorldPoint = useCallback(
		(coordX: number, coordY: number): Point => {
			// idwがnullの場合はそもそも呼ばれない
			if (idw == null) return new Point(0, 0);
			return new Point(
				(coordX / idw.chipPitch.x) * CHIPMAP_AREA_WIDTH,
				((idw.chipPitch.y - coordY) / idw.chipPitch.y) * CHIPMAP_AREA_HEIGHT,
			);
		},
		[idw],
	);

	useEffect(() => {
		if (idw == null || selectedFov == null) return;
		setDisplayedMapTopLeftWorldPoint(
			calcWorldPoint(selectedFov.coordX, selectedFov.coordY),
		);
	}, [selectedFov, idw, setDisplayedMapTopLeftWorldPoint, calcWorldPoint]);

	useEffect(() => {
		if (idw == null || selectedDefect == null) return;
		setDisplayedMapTopLeftWorldPoint(
			calcWorldPoint(selectedDefect.coordX, selectedDefect.coordY),
		);
	}, [selectedDefect, idw, setDisplayedMapTopLeftWorldPoint, calcWorldPoint]);

	return { displayedMapTopLeftWorldPoint };
};
