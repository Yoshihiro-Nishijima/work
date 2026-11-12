import { PixiComponent } from "@pixi/react";
import {
	type DisplayObject as PixiDisplayObject,
	Graphics as PixiGraphics,
	type Point,
} from "pixi.js";

interface PixiComponentRectSelectionProps {
	// 選択矩形開始
	start: Point;
	// 選択矩形終了
	end: Point;
}

const RectSelectionDrawComponent = PixiComponent<
	PixiComponentRectSelectionProps,
	PixiDisplayObject
>("RectSelectionDraw", {
	create: (): PixiDisplayObject => {
		return new PixiGraphics() as PixiDisplayObject;
	},
	applyProps: (o, _oldProps, _newProps) => {
		const g = o as PixiGraphics;
		g.clear();
		g.lineStyle(0, "yellow");
		g.beginFill("yellow", 0.4);
		g.drawRect(
			Math.min(_newProps.start.x, _newProps.end.x),
			Math.min(_newProps.start.y, _newProps.end.y),
			Math.abs(_newProps.end.x - _newProps.start.x),
			Math.abs(_newProps.end.y - _newProps.start.y),
		);
		g.endFill();

		return g as PixiDisplayObject;
	},
});

export const RectSelection = ({
	start,
	end,
}: PixiComponentRectSelectionProps): JSX.Element => {
	return <RectSelectionDrawComponent start={start} end={end} />;
};
