import { atom, useAtom } from "jotai";
import { Point } from "pixi.js";
import type { Dispatch, SetStateAction } from "react";

export const DEFAULT_CONTEXT_MENU_POINT = new Point(0, 0);

const isContextMenuDisplayAtom = atom(false);

const contextMenuPointAtom = atom(DEFAULT_CONTEXT_MENU_POINT);

interface UseContextMenuDisplay {
	isContextMenuDisplay: boolean;
	setIsContextMenuDisplay: Dispatch<SetStateAction<boolean>>;
	contextMenuPoint: Point;
	setContextMenuPoint: Dispatch<SetStateAction<Point>>;
}

export const useContextMenuDisplay = (): UseContextMenuDisplay => {
	const [isContextMenuDisplay, setIsContextMenuDisplay] = useAtom(
		isContextMenuDisplayAtom,
	);
	const [contextMenuPoint, setContextMenuPoint] = useAtom(contextMenuPointAtom);
	return {
		isContextMenuDisplay,
		setIsContextMenuDisplay,
		contextMenuPoint,
		setContextMenuPoint,
	};
};
