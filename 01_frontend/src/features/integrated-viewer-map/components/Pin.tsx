import { Container, Sprite } from "@pixi/react";
import locationOn from "assets/location_on_24px.svg";
import { useAtomValue } from "jotai";
import * as PIXI from "pixi.js";

import { getPinSizeSelector, usePinInfo } from "../hooks/usePinInfo";

export const Pin = (): JSX.Element => {
	const { pinPoint } = usePinInfo();
	const pinSize = useAtomValue(getPinSizeSelector);

	const texture = PIXI.Texture.from(locationOn, undefined, undefined);
	return (
		<Container eventMode="none">
			{pinPoint != null && (
				<Sprite
					texture={texture}
					x={pinPoint.x - pinSize / 2}
					y={pinPoint.y - pinSize}
					width={pinSize}
					height={pinSize}
				/>
			)}
		</Container>
	);
};
