import { useRef } from "react";

import { Box } from "@mui/material";
import { useIdw } from "../../map/hooks/useIdw";
import {
	CHIPMAP_AREA_HEIGHT,
	CHIPMAP_AREA_WIDTH,
	SELECTED_DISPLAY_AREA_HEIGHT,
	SELECTED_DISPLAY_AREA_WIDTH,
	useSelectedDisplayArea,
} from "../hooks/useSelectedDisplayArea";

export const ChipMap = (): JSX.Element | null => {
	const { idw } = useIdw();

	const svgRef = useRef<SVGSVGElement>(null);

	const { displayedMapTopLeftWorldPoint } = useSelectedDisplayArea();

	const chipAreaToSVG = (): JSX.Element => {
		return (
			<rect
				x={0}
				y={0}
				width={CHIPMAP_AREA_WIDTH}
				height={CHIPMAP_AREA_HEIGHT}
				stroke="black"
				strokeWidth="2"
				fill="white"
				pointerEvents="none"
			/>
		);
	};

	const selectedDisplayArea = (): JSX.Element => {
		return (
			<rect
				x={displayedMapTopLeftWorldPoint.x}
				y={displayedMapTopLeftWorldPoint.y}
				width={SELECTED_DISPLAY_AREA_WIDTH}
				height={SELECTED_DISPLAY_AREA_HEIGHT}
				stroke="green"
				strokeWidth="2"
				fill="lime"
			/>
		);
	};

	return (
		<Box>
			<svg
				ref={svgRef}
				viewBox={`${0} ${0} ${CHIPMAP_AREA_WIDTH} ${CHIPMAP_AREA_HEIGHT}`}
				style={{ width: CHIPMAP_AREA_WIDTH, height: CHIPMAP_AREA_HEIGHT }}
			>
				{idw != null ? chipAreaToSVG() : null}
				{/* チップ境界 */}
				{selectedDisplayArea()}
				{/* 選択中の表示領域 */}
			</svg>
		</Box>
	);
};
