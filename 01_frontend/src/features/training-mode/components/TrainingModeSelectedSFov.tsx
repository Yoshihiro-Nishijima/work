import { Container, PixiComponent } from "@pixi/react";
import {
	type DisplayObject as PixiDisplayObject,
	Graphics as PixiGraphics,
} from "pixi.js";

import { useSFovThumbnailDrawInfo } from "~/features/integrated-viewer-map/hooks/useSFovThumbnailDrawInfo";

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

const TrainingModeSelectedSFovFrameDraw = PixiComponent<
	PixiComponentSelectedSFovFrameProps,
	PixiDisplayObject
>("TrainingModeSelectedSFovFrameDraw", {
	create: (): PixiDisplayObject => {
		return new PixiGraphics() as PixiDisplayObject;
	},
	applyProps: (o, _oldProps, _newProps) => {
		const g = o as PixiGraphics;
		g.clear();
		g.lineStyle(0.0005, "yellow");
		g.drawRect(_newProps.x, _newProps.y, _newProps.width, _newProps.height);

		return g as PixiDisplayObject;
	},
});

export const TrainingModeSelectedSFov = (): JSX.Element => {
	const { getSelectedSFovDrawInfoList } = useSFovThumbnailDrawInfo();
	const drawSelectedSFovsInfo = getSelectedSFovDrawInfoList();

	if (drawSelectedSFovsInfo == null || drawSelectedSFovsInfo.length === 0) {
		return <></>;
	}

	return (
		<Container>
			{drawSelectedSFovsInfo.map((element, idx) => (
				// biome-ignore lint/suspicious/noArrayIndexKey: 単純置き換えが困難な為、指摘対象外
				<Container key={idx}>
					<TrainingModeSelectedSFovFrameDraw
						x={element.point.x}
						y={element.point.y}
						width={element.width}
						height={element.height}
					/>
				</Container>
			))}
		</Container>
	);
};
