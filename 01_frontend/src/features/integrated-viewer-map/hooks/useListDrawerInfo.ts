import { atom, useAtom } from "jotai";
import type { Dispatch, SetStateAction } from "react";

const LIST_DRAWER_WIDTH = 380;

const isListDrawerOpenAtom = atom(false);
const listDrawerWidthAtom = atom(LIST_DRAWER_WIDTH);

interface UseListDrawerInfo {
	isListDrawerOpen: boolean;
	setListDrawerOpen: Dispatch<SetStateAction<boolean>>;
	listDrawerWidth: number;
	setListDrawerWidth: Dispatch<SetStateAction<number>>;
}

export const useListDrawerInfo = (): UseListDrawerInfo => {
	const [isListDrawerOpen, setListDrawerOpen] = useAtom(isListDrawerOpenAtom);
	const [listDrawerWidth, setListDrawerWidth] = useAtom(listDrawerWidthAtom);
	return {
		isListDrawerOpen,
		setListDrawerOpen,
		listDrawerWidth,
		setListDrawerWidth,
	};
};
