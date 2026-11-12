import { atom, useAtom } from "jotai";
import type { Point } from "pixi.js";
import type { Dispatch, SetStateAction } from "react";

import { scaleAtom } from "../hooks/useMapInfo";

const pinPointAtom = atom<Point | undefined>(undefined);

const PIN_SIZE = 50.0;

interface UsePinInfo {
	pinPoint: Point | undefined;
	setPinPoint: Dispatch<SetStateAction<Point | undefined>>;
}

export const getPinSizeSelector = atom((get) => {
	const scale = get(scaleAtom);
	return scale !== 0 ? PIN_SIZE / scale : 0;
});

export const usePinInfo = (): UsePinInfo => {
	const [pinPoint, setPinPoint] = useAtom(pinPointAtom);

	return { pinPoint, setPinPoint };
};
