import { atom, useAtom } from "jotai";
import { Point } from "pixi.js";
import type { Dispatch, SetStateAction } from "react";

export const DEFAULT_EMPHASIS_POINT = new Point(0, 0);

const emphasisPointAtom = atom(DEFAULT_EMPHASIS_POINT);

interface UseEmphasisPoint {
	emphasisPoint: Point;
	setEmphasisPoint: Dispatch<SetStateAction<Point>>;
}

export const useEmphasisPoint = (): UseEmphasisPoint => {
	const [emphasisPoint, setEmphasisPoint] = useAtom(emphasisPointAtom);
	return { emphasisPoint, setEmphasisPoint };
};
