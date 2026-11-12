import { atom, useAtom } from "jotai";
import type { Dispatch, SetStateAction } from "react";

import type { Scroll } from "../types";

const scrollAtom = atom<Scroll>({ x: 0, y: 0, smooth: false });

export interface UseScroll {
	scroll: Scroll;
	setScroll: Dispatch<SetStateAction<Scroll>>;
}
export const useScroll = (): UseScroll => {
	const [scroll, setScroll] = useAtom(scrollAtom);
	return { scroll, setScroll };
};
