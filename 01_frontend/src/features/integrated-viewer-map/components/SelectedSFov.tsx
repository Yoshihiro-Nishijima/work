import { Container, PixiComponent } from "@pixi/react";
import {
	type DisplayObject as PixiDisplayObject,
	Graphics as PixiGraphics,
} from "pixi.js";

import { useSFovThumbnailDrawInfo } from "../hooks/useSFovThumbnailDrawInfo";

interface PixiComponentSelectedSFovFrameProps {
	// sFOV選択枠 X座標(左上)
	x: number;
	// sFOV選択枠 Y座標(左上)
	y: number;
	// sFOV選択枠 幅
	width: number;
	// sFOV選択枠 高さ
	height: number;
}

const SelectedSFovFrameDraw = PixiComponent<
	PixiComponentSelectedSFovFrameProps,
	PixiDisplayObject
>("SelectedSFovFrameDraw", {
	create: (): PixiDisplayObject => {
		return new PixiGraphics() as PixiDisplayObject;
	},
	applyProps: (o, _oldProps, _newProps) => {
		const g = o as PixiGraphics;
		g.clear();
		g.lineStyle(0.0005, "lime");
		g.drawRect(_newProps.x, _newProps.y, _newProps.width, _newProps.height);

		return g as PixiDisplayObject;
	},
});

export const SelectedSFov = (): JSX.Element => {
	const { getSelectedSFovDrawInfo } = useSFovThumbnailDrawInfo();
	const drawSelectedSFovInfo = getSelectedSFovDrawInfo();
	if (drawSelectedSFovInfo == null) return <></>;
	return (
		<Container>
			<SelectedSFovFrameDraw
				x={drawSelectedSFovInfo.point.x}
				y={drawSelectedSFovInfo.point.y}
				width={drawSelectedSFovInfo.width}
				height={drawSelectedSFovInfo.height}
			/>
		</Container>
	);
};
