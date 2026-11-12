import { PixiComponent } from "@pixi/react";
import {
	type DisplayObject as PixiDisplayObject,
	Graphics as PixiGraphics,
} from "pixi.js";
import { useMemo } from "react";

import { useInspectionAreas } from "~/features/map/hooks";

import { IS_CHIP_EXIST } from "~/config";
import { type ChipMapInfo, useChipMapInfo } from "../hooks/useChipMapInfo";
import { isChipMapDisplayLevel } from "../hooks/useMapInfo";
import type { InspectionAreaDrawParam } from "../types";

/**
 * 検査範囲矩形描画用パラメータ
 */
interface PixiComponentDefectRangeProps {
	// 描画する検査範囲
	inspectionAreas: InspectionAreaDrawParam[];
	// 検査範囲の変更判定用キー
	inspectionAreasKey: string;
	// ChipMap描画情報
	chipMapInfo: ChipMapInfo;
}

const INSPECTION_AREA_COLOR = "rgb(255,250,205)";

// 検査範囲矩形表示
const InspectionAreaComponent = PixiComponent<
	PixiComponentDefectRangeProps,
	PixiDisplayObject
>("InspectionArea", {
	create: (): PixiDisplayObject => {
		return new PixiGraphics() as PixiDisplayObject;
	},
	applyProps: (o, _oldProps: PixiComponentDefectRangeProps, _newProps) => {
		if (_oldProps.inspectionAreasKey === _newProps.inspectionAreasKey) {
			// inspectionArea の内容が変わってなければ再描画不要
			return o;
		}
		const g = o as PixiGraphics;
		g.clear();
		g.lineStyle(0, INSPECTION_AREA_COLOR).beginFill(INSPECTION_AREA_COLOR, 1);

		// 検査範囲描画
		for (const inspectionArea of _newProps.inspectionAreas) {
			if (
				_newProps.chipMapInfo.chipExist[inspectionArea.drawChipIndex.y][
					inspectionArea.drawChipIndex.x
				] === IS_CHIP_EXIST
			) {
				const x =
					inspectionArea.idwCoordinateMinX * _newProps.chipMapInfo.scaleX +
					_newProps.chipMapInfo.pixelSizeX * inspectionArea.drawChipIndex.x;
				const y =
					_newProps.chipMapInfo.pixelSizeY -
					inspectionArea.idwCoordinateMaxY * _newProps.chipMapInfo.scaleY +
					_newProps.chipMapInfo.pixelSizeY * inspectionArea.drawChipIndex.y;
				const width =
					(inspectionArea.idwCoordinateMaxX -
						inspectionArea.idwCoordinateMinX) *
					_newProps.chipMapInfo.scaleX;
				const height =
					(inspectionArea.idwCoordinateMaxY -
						inspectionArea.idwCoordinateMinY) *
					_newProps.chipMapInfo.scaleY;
				g.drawRect(x, y, width, height);
			}
		}
		return g as PixiDisplayObject;
	},
});

export const InspectionArea = (): JSX.Element => {
	const { chipMapInfo } = useChipMapInfo();
	const { inspectionAreas } = useInspectionAreas();
	const enabled = isChipMapDisplayLevel();
	const inspectionAreasKey = useMemo(
		() =>
			inspectionAreas
				.map(
					(area) =>
						`${area.areaNo}:${area.drawChipIndex.x}:${area.drawChipIndex.y}:` +
						`${area.idwCoordinateMinX}:${area.idwCoordinateMinY}:` +
						`${area.idwCoordinateMaxX}:${area.idwCoordinateMaxY}`,
				)
				.join("|"),
		[inspectionAreas],
	);
	if (inspectionAreas.length === 0 || !enabled) return <></>;

	return (
		<InspectionAreaComponent
			inspectionAreas={inspectionAreas}
			inspectionAreasKey={inspectionAreasKey}
			chipMapInfo={chipMapInfo}
		/>
	);
};
