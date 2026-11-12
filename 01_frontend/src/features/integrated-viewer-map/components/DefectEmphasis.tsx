import { PixiComponent } from "@pixi/react";
import {
	type DisplayObject as PixiDisplayObject,
	Graphics as PixiGraphics,
	type Point,
} from "pixi.js";

import { useDisplayedDefect } from "../hooks/useDisplayedDefect";
import { useEmphasisPoint } from "../hooks/useEmphasisPoint";
import { useDefectMapInfo, useWaferMapInfo } from "../hooks/useMapInfo";

// 強調表示
interface DefectEmphasisComponentProps {
	// 強調表示座標
	emphasisPoint: Point;
	// 半径
	radius: number;
}

// 欠陥点強調表示
const DefectEmphasisComponent = PixiComponent<
	DefectEmphasisComponentProps,
	PixiDisplayObject
>("DefectEmphasis", {
	create: (): PixiDisplayObject => {
		return new PixiGraphics() as PixiDisplayObject;
	},
	applyProps: (o, _oldProps, _newProps) => {
		const g = o as PixiGraphics;

		g.clear();
		if (
			_newProps.emphasisPoint == null ||
			(_newProps.emphasisPoint.x === -1 && _newProps.emphasisPoint.y === -1)
		) {
			return;
		}
		g.lineStyle(0, "red").beginFill("red");
		g.drawCircle(
			_newProps.emphasisPoint.x,
			_newProps.emphasisPoint.y,
			_newProps.radius,
		);

		return g as PixiDisplayObject;
	},
});

export const DefectEmphasis = (): JSX.Element => {
	const { enabledWaferColorMap } = useWaferMapInfo();
	const { isDisplayedDefect } = useDisplayedDefect();
	const { defectEmphasisPointRadius: radius } = useDefectMapInfo();
	const { emphasisPoint } = useEmphasisPoint();
	if (enabledWaferColorMap || !isDisplayedDefect) return <></>;
	return (
		<DefectEmphasisComponent emphasisPoint={emphasisPoint} radius={radius} />
	);
};
