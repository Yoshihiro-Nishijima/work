import { PixiComponent } from "@pixi/react";
import {
	type DisplayObject as PixiDisplayObject,
	Graphics as PixiGraphics,
} from "pixi.js";
import { useMemo } from "react";

import { useChipDefects } from "~/features/map/hooks";

import { IS_CHIP_EXIST } from "~/config";
import { useChipMapInfo } from "../hooks/useChipMapInfo";
import { useWaferMapInfo } from "../hooks/useMapInfo";
import {
	DEFAULT_COLOR_MAP_SETTINGS,
	getPixiColor,
	type ColorMapSettings,
} from "../utils/colorMap";

interface WaferMapInfo {
	pixelSizeX: number;
	pixelSizeY: number;
	chipArrayCountX: number;
	chipArrayCountY: number;
	chipExist: string[];
	chipColorMap: Map<string, string>;
	heatMapCountMap: Map<string, number> | null;
	isMaxChipCountZero: boolean;
	colorMapSettings: ColorMapSettings;
	enabledWaferColorMap: boolean;
	chipLineThickness: number;
}

const calcRectPoints = (
	x: number,
	y: number,
	width: number,
	height: number,
): number[] => {
	return [x, y, x + width, y, x + width, y + height, x, y + height];
};

const WaferMapComponent = PixiComponent<WaferMapInfo, PixiDisplayObject>(
	"WaferMap",
	{
		create: (props: WaferMapInfo) => {
			return new PixiGraphics() as PixiDisplayObject;
		},
		applyProps: (o, _oldProps, _newProps) => {
			const g = o as PixiGraphics;
			// clearしなければ線の太さを変更できない（細くできない）ため、描画時は毎回clear
			g.clear();
			g.lineStyle(_newProps.chipLineThickness, "black").beginFill("white", 1);
			for (let i = 0; i < _newProps.chipArrayCountX; i++) {
				for (let j = 0; j < _newProps.chipArrayCountY; j++) {
					const rectPoints = calcRectPoints(
						i * _newProps.pixelSizeX,
						j * _newProps.pixelSizeY,
						_newProps.pixelSizeX,
						_newProps.pixelSizeY,
					);
					if (_newProps.chipExist[j][i] !== IS_CHIP_EXIST) {
						g.beginFill(
							_newProps.heatMapCountMap == null ? "gray" : "#808080",
							_newProps.heatMapCountMap == null ? 0.3 : 1,
						);
					} else if (_newProps.heatMapCountMap != null) {
						const count = _newProps.heatMapCountMap.get(`${i},${j}`);
						g.beginFill(
							count == null && !_newProps.isMaxChipCountZero
								? "#D3D3D3"
								: getPixiColor(
										count ?? 0,
										_newProps.colorMapSettings.maxCount,
										_newProps.colorMapSettings.presetId,
									),
							1,
						);
					} else {
						g.beginFill("white", 1);
						// defectCountMapのキーは原点が左上のCanvas座標
						const key = `${i},${j}`;
						if (_newProps.chipColorMap.has(key)) {
							// データあり
							g.beginFill("white", 1);
						} else {
							// データなし
							g.beginFill("lightgray", 1);
						}
					}
					g.drawPolygon(rectPoints);
				}
			}
			g.endFill();

			if (_newProps.enabledWaferColorMap) {
				// 円描画
				g.drawCircle(
					(_newProps.chipArrayCountX * _newProps.pixelSizeX) / 2,
					(_newProps.chipArrayCountY * _newProps.pixelSizeY) / 2,
					(_newProps.chipArrayCountX * _newProps.pixelSizeX) / 2,
				);
			}

			return g as PixiDisplayObject;
		},
	},
);

export const WaferMap = ({
	heatMapCountMap = null,
	isMaxChipCountZero = false,
	colorMapSettings = DEFAULT_COLOR_MAP_SETTINGS,
}: {
	heatMapCountMap?: Map<string, number> | null;
	isMaxChipCountZero?: boolean;
	colorMapSettings?: ColorMapSettings;
}): JSX.Element => {
	const { chipMapInfo } = useChipMapInfo();
	const { chipColorMap } = useChipDefects();
	const { chipLineThickness, enabledWaferColorMap } = useWaferMapInfo();

	return useMemo(
		() => (
			<WaferMapComponent
				pixelSizeX={chipMapInfo.pixelSizeX}
				pixelSizeY={chipMapInfo.pixelSizeY}
				chipArrayCountX={chipMapInfo.chipArrayCountX}
				chipArrayCountY={chipMapInfo.chipArrayCountY}
				chipExist={chipMapInfo.chipExist}
				chipColorMap={chipColorMap}
				heatMapCountMap={heatMapCountMap}
				isMaxChipCountZero={isMaxChipCountZero}
				colorMapSettings={colorMapSettings}
				enabledWaferColorMap={enabledWaferColorMap}
				chipLineThickness={chipLineThickness}
			/>
		),
		[
			chipMapInfo,
			chipColorMap,
			heatMapCountMap,
			isMaxChipCountZero,
			colorMapSettings,
			enabledWaferColorMap,
			chipLineThickness,
		],
	);
};
