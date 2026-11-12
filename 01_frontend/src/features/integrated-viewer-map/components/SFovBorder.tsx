import { Container, Graphics } from "@pixi/react";

import { useSFovThumbnailDrawInfo } from "../hooks/useSFovThumbnailDrawInfo";
import { useSfovBorderDisplay } from "../hooks/useSfovBorderDisplay";

export const SFovBorder = (): JSX.Element => {
	const { sFovThumbnailDrawInfos } = useSFovThumbnailDrawInfo();
	const { isSfovBorderDisplay } = useSfovBorderDisplay();
	if (!isSfovBorderDisplay) return <></>;
	return (
		<Container>
			{sFovThumbnailDrawInfos.map((element) => (
				<Container key={element.imageid}>
					<Graphics
						draw={(g) => {
							g.lineStyle(0.0005, "black");
							g.drawRect(
								element.mfovImagePoints.x,
								element.mfovImagePoints.y,
								element.width,
								element.height,
							);
						}}
					/>
				</Container>
			))}
		</Container>
	);
};
