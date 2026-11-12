import { atom, useAtom } from "jotai";
import type { Dispatch, SetStateAction } from "react";

import type { SFovThumbnailDrawInfo } from "~/features/integrated-viewer-map/hooks/useSFovThumbnailDrawInfo";

const mapContextMenuSFovAtom = atom<SFovThumbnailDrawInfo | undefined>(
	undefined,
);

export interface UseMapContextMenuSFov {
	mapContextMenuSFov?: SFovThumbnailDrawInfo;
	setMapContextMenuSFov: Dispatch<
		SetStateAction<SFovThumbnailDrawInfo | undefined>
	>;
}

export const useMapContextMenuSFov = (): UseMapContextMenuSFov => {
	const [mapContextMenuSFov, setMapContextMenuSFov] = useAtom(
		mapContextMenuSFovAtom,
	);
	return { mapContextMenuSFov, setMapContextMenuSFov };
};
