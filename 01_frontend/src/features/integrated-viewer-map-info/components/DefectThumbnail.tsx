import { useCallback } from "react";

import { useSelectedDefect } from "~/features/misc/hooks/useSelectedDefect";

export const THUMBNAIL_AREA_WIDTH = 200;
export const THUMBNAIL_AREA_HEIGHT = 200;

export const DefectThumbnail = (): JSX.Element => {
	const { selectedDefect } = useSelectedDefect();

	const imgRef = useCallback(
		(node: HTMLImageElement | null) => {
			if (node == null || selectedDefect == null) return;
			node.src = selectedDefect.src;
		},
		[selectedDefect],
	);

	return (
		<img
			ref={imgRef}
			width={THUMBNAIL_AREA_WIDTH}
			height={THUMBNAIL_AREA_HEIGHT}
		/>
	);
};
