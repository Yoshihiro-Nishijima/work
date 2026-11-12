import { atom, useAtom } from "jotai";
import { useAtomCallback } from "jotai/utils";
import { Point } from "pixi.js";
import { type Dispatch, type SetStateAction, useCallback } from "react";
import { useMapSelectionStatus } from "~/features/misc/hooks/useMapSelectionStatus";
import { selectedDefectAtom } from "~/features/misc/hooks/useSelectedDefect";
import { selectedFovAtom } from "~/features/s-fov-list/hooks/useFovList";
import { useMfovnoForSEMImage } from "./useMfovnoForSEMImage";

const sfovnoAtom = atom<number | undefined>(undefined);

interface UseSfovnoForSEMImage {
	sfovnoForSEMImage: number | undefined;
	setSfovnoForSEMImage: Dispatch<SetStateAction<number | undefined>>;
	initSFovViewSEMImageInfo: () => void;
}

export const useSfovnoForSEMImage = (): UseSfovnoForSEMImage => {
	const [sfovnoForSEMImage, setSfovnoForSEMImage] = useAtom(sfovnoAtom);
	const { setMfovnoForSEMImage } = useMfovnoForSEMImage();
	const { setSelectedChipIndex } = useMapSelectionStatus();

	const initSFovViewSEMImageInfo = useAtomCallback(
		useCallback(
			(get, set) => {
				if (get(sfovnoAtom) != null) return;
				const selectedFov = get(selectedFovAtom);
				if (selectedFov != null) {
					set(sfovnoAtom, selectedFov.sfovno);
					return;
				}
				const selectedDefect = get(selectedDefectAtom);
				if (selectedDefect == null) return;
				setMfovnoForSEMImage(selectedDefect.mFOVno);
				set(sfovnoAtom, selectedDefect.sFOVno);
				setSelectedChipIndex(
					new Point(selectedDefect?.chipX, selectedDefect?.chipY),
				);
			},
			[setMfovnoForSEMImage, setSelectedChipIndex],
		),
	);

	return { sfovnoForSEMImage, setSfovnoForSEMImage, initSFovViewSEMImageInfo };
};
