import { PixiComponent } from "@pixi/react";
import {
	type DisplayObject as PixiDisplayObject,
	Graphics as PixiGraphics,
	type Point,
} from "pixi.js";
import { useMemo } from "react";

import { useIdw } from "~/features/map/hooks";
import { useMapSelectionStatus } from "~/features/misc/hooks/useMapSelectionStatus";

import { useChipMapInfo } from "../hooks/useChipMapInfo";
import { useWaferMapInfo } from "../hooks/useMapInfo";

const calcRectPoints = (
	x: number,
	y: number,
	width: number,
	height: number,
): number[] => {
	return [x, y, x + width, y, x + width, y + height, x, y + height];
};

/**
 * 選択中Chip描画用パラメータ
 */
interface PixiComponentSelectedChipProps {
	// 1chipの pixel数
	pixelSizeX: number;
	pixelSizeY: number;
	// 選択中のChip(IDW上のChip座標)
	selectedChipIndex: Point;
	// 描画上のChip座標変換関数
	toDrawChipIndex: (idwChipIndex: Point) => Point;
	// Chip境界線の太さ
	chipLineThickness: number;
}

const SelectedChipComponent = PixiComponent<
	PixiComponentSelectedChipProps,
	PixiDisplayObject
>("SelectChip", {
	create: () => {
		return new PixiGraphics() as PixiDisplayObject;
	},
	applyProps: (o, _oldProps, _newProps) => {
		const g = o as PixiGraphics;
		// clearしなければ線の太さを変更できない（細くできない）ため、描画時は毎回clear
		g.clear();

		// 選択中Chip強調表示
		const drawChipIndex = _newProps.toDrawChipIndex(
			_newProps.selectedChipIndex,
		);
		const rectPoints = calcRectPoints(
			drawChipIndex.x * _newProps.pixelSizeX,
			drawChipIndex.y * _newProps.pixelSizeY,
			_newProps.pixelSizeX,
			_newProps.pixelSizeY,
		);
		g.lineStyle(_newProps.chipLineThickness, "lime");
		g.drawPolygon(rectPoints);

		return g as PixiDisplayObject;
	},
});

export const SelectedChip = (): JSX.Element => {
	const { chipMapInfo } = useChipMapInfo();
	const { selectedChipIndex } = useMapSelectionStatus();
	const { toDrawChipIndex } = useIdw();
	const { chipLineThickness } = useWaferMapInfo();

	return useMemo(
		() => (
			<SelectedChipComponent
				pixelSizeX={chipMapInfo.pixelSizeX}
				pixelSizeY={chipMapInfo.pixelSizeY}
				selectedChipIndex={selectedChipIndex}
				toDrawChipIndex={toDrawChipIndex}
				chipLineThickness={chipLineThickness}
			/>
		),
		[chipMapInfo, selectedChipIndex, toDrawChipIndex, chipLineThickness],
	);
};
