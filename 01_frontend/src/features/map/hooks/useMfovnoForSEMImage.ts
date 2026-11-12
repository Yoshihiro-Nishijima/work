import { atom, useAtom } from "jotai";
import type { Dispatch, SetStateAction } from "react";

const mfovnoAtom = atom<number | undefined>(undefined);

interface UseMfovnoForSEMImage {
	mfovnoForSEMImage: number | undefined;
	setMfovnoForSEMImage: Dispatch<SetStateAction<number | undefined>>;
}

export const useMfovnoForSEMImage = (): UseMfovnoForSEMImage => {
	const [mfovnoForSEMImage, setMfovnoForSEMImage] = useAtom(mfovnoAtom);
	return { mfovnoForSEMImage, setMfovnoForSEMImage };
};
