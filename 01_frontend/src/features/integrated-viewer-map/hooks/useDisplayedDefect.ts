import { atom, useAtom } from "jotai";
import type { Dispatch, SetStateAction } from "react";

const isDisplayedDefectAtom = atom(true);

interface UseDisplayedDefect {
	isDisplayedDefect: boolean;
	setIsDisplayedDefect: Dispatch<SetStateAction<boolean>>;
}

export const useDisplayedDefect = (): UseDisplayedDefect => {
	const [isDisplayedDefect, setIsDisplayedDefect] = useAtom(
		isDisplayedDefectAtom,
	);
	return { isDisplayedDefect, setIsDisplayedDefect };
};
