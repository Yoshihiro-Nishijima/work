import { atom, useAtom } from "jotai";
import { useAtomCallback } from "jotai/utils";
import { useCallback } from "react";
import { useSFov } from "~/features/integrated-viewer-map/hooks/useSFov";
import { useSfovnoForSEMImage } from "~/features/map/hooks/useSfovnoForSEMImage";
import { selectedDefectAtom } from "~/features/misc/hooks/useSelectedDefect";
import { existsCoordAtom } from "~/features/s-fov-image/hooks/useSEMImage";
import {
	selectedFovAtom,
	useFovList,
} from "~/features/s-fov-list/hooks/useFovList";

/* SFovViewModa表示状態管理 */
const isSFovViewModalOpenAtom = atom(false);

export interface UseSFovViewModal {
	isSFovViewModalOpen: boolean;
	updateSFovViewModalOpen: (isOpen: boolean) => void;
}

export const useSFovViewModal = (): UseSFovViewModal => {
	const { initSFovViewSEMImageInfo } = useSfovnoForSEMImage();
	const [isSFovViewModalOpen, setSFovViewModalOpen] = useAtom(
		isSFovViewModalOpenAtom,
	);
	const { getFovByFovNo } = useFovList();

	const { setIsSpecifiedCoordInSelectedSFov } = useSFov();

	const setIsSpecifiedCoord = useAtomCallback(
		useCallback(
			(get, _set) => {
				const existsCoord = get(existsCoordAtom);
				if (existsCoord) return;
				const selectedFov = get(selectedFovAtom);
				if (selectedFov != null) {
					setIsSpecifiedCoordInSelectedSFov(
						selectedFov.indexX,
						selectedFov.indexY,
						selectedFov.coordX,
						selectedFov.coordY,
					);
					return;
				}
				const selectedDefect = get(selectedDefectAtom);
				if (selectedDefect != null) {
					// Defectが含まれているsFovを取得
					const fov = getFovByFovNo(
						selectedDefect.mFOVno,
						selectedDefect.sFOVno,
					);
					if (fov != null) {
						setIsSpecifiedCoordInSelectedSFov(
							fov.indexX,
							fov.indexY,
							fov.coordX,
							fov.coordY,
						);
					}
				}
			},
			[setIsSpecifiedCoordInSelectedSFov, getFovByFovNo],
		),
	);

	const updateSFovViewModalOpen = (isOpen: boolean): void => {
		if (isOpen) {
			initSFovViewSEMImageInfo();
			setIsSpecifiedCoord();
		}
		setSFovViewModalOpen(isOpen);
	};
	return { isSFovViewModalOpen, updateSFovViewModalOpen };
};
