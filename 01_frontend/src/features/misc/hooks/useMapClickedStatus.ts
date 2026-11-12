import { atom, useAtom } from "jotai";
import type { Point } from "pixi.js";
import { useCallback } from "react";

interface MapClickEvent {
	point: Point;
	button: number | undefined;
	targetName: string | undefined;
	clientPosition: { x: number; y: number } | undefined;
}

const mapClickEventAtom = atom<MapClickEvent | undefined>(undefined);

interface UseMapClickedStatus {
	clickedPoint: Point | undefined;
	clickedButton: number | undefined;
	clickedTargetName: string | undefined;
	clientPosition: { x: number; y: number } | undefined;
	clickEvent: MapClickEvent | undefined;
	setClickedPoint: (
		point: Point | undefined,
		button?: number,
		targetName?: string,
		clientPosition?: { x: number; y: number },
	) => void;
}

export const useMapClickedStatus = (): UseMapClickedStatus => {
	const [clickEvent, setClickEvent] = useAtom(mapClickEventAtom);
	const setClickedPoint = useCallback(
		(
			point: Point | undefined,
			button?: number,
			targetName?: string,
			clientPosition?: { x: number; y: number },
		): void => {
			setClickEvent(
				point == null
					? undefined
					: { point, button, targetName, clientPosition },
			);
		},
		[setClickEvent],
	);

	return {
		clickedPoint: clickEvent?.point,
		clickedButton: clickEvent?.button,
		clickedTargetName: clickEvent?.targetName,
		clientPosition: clickEvent?.clientPosition,
		clickEvent,
		setClickedPoint,
	};
};
