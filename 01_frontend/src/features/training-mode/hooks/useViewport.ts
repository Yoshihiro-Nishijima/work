import { atom, useAtom } from "jotai";
import type { Viewport } from "pixi-viewport";
import type { Point } from "pixi.js";
import type { Dispatch, SetStateAction } from "react";

export const useViewportAtom = atom<Viewport | undefined>(undefined);

export interface UseViewport {
	viewport: Viewport | undefined;
	toWorld: (x: number, y: number) => Point | undefined;
	setViewport: Dispatch<SetStateAction<Viewport | undefined>>;
}

export const useViewport = (): UseViewport => {
	const [viewport, setViewport] = useAtom(useViewportAtom);
	const toWorld = (x: number, y: number): Point | undefined => {
		return viewport?.toWorld(x, y);
	};
	return { viewport, toWorld, setViewport };
};
