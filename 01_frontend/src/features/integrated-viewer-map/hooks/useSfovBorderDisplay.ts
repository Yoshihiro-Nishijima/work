import { atom, useAtom } from "jotai";
import type { Dispatch, SetStateAction } from "react";

const isSfovBorderDisplayAtom = atom(false);

interface UseSfovBorderDisplay {
	isSfovBorderDisplay: boolean;
	setIsSfovBorderDisplay: Dispatch<SetStateAction<boolean>>;
}

export const useSfovBorderDisplay = (): UseSfovBorderDisplay => {
	const [isSfovBorderDisplay, setIsSfovBorderDisplay] = useAtom(
		isSfovBorderDisplayAtom,
	);
	return { isSfovBorderDisplay, setIsSfovBorderDisplay };
};
