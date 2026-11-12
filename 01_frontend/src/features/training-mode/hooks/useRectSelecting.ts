import { atom, useAtom, useAtomValue } from "jotai";
import { Point } from "pixi.js";

import {
	INTEGRATED_VIEWER_MAP_TITLEBAR_HEIGHT,
	INTEGRATED_VIEWER_MENU_WIDTH,
} from "~/features/integrated-viewer-map/hooks/useMapAreaInfo";
import { useSFovThumbnailDrawInfo } from "~/features/integrated-viewer-map/hooks/useSFovThumbnailDrawInfo";
import type { DisplayPoint } from "~/features/integrated-viewer-map/types";
import { useSelectedSFovImageIdList } from "~/features/misc/hooks/useSelectedSFovImageIdList";

import { getPickedFovImageIdListAtom } from "~/features/s-fov-list/hooks/usePickedFov";
import { useViewport } from "./useViewport";

const useRectSelectingAtom = atom(false);
const useRectSelectingPointStart = atom<Point | undefined>(undefined);
const useRectSelectingPointEnd = atom<Point | undefined>(undefined);

export interface UseRectSelecting {
	isRectSelecting: boolean;
	onMouseMoveCapture: (e: MouseEvent, trainingModeMenuWidth: number) => void;
	onMouseUpCapture: (e: MouseEvent) => void;
	rectSelectingPointStart: Point | undefined;
	rectSelectingPointEnd: Point | undefined;
}

export const useRectSelecting = (): UseRectSelecting => {
	const [isRectSelecting, setIsRectSelecting] = useAtom(useRectSelectingAtom);
	const [rectSelectingPointStart, setRectSelectingPointStart] = useAtom(
		useRectSelectingPointStart,
	);
	const [rectSelectingPointEnd, setRectSelectingPointEnd] = useAtom(
		useRectSelectingPointEnd,
	);

	const { toWorld } = useViewport();
	const { sFovThumbnailDrawInfos } = useSFovThumbnailDrawInfo();
	const { addById } = useSelectedSFovImageIdList();
	const pickedFovImageIdList = useAtomValue(getPickedFovImageIdListAtom);
	const hasPickedImageIds = pickedFovImageIdList.length !== 0;

	const onMouseMoveCapture = (
		e: MouseEvent,
		trainingModeMenuWidth: number,
	): void => {
		if (toWorld == null) return;
		// ctrl押下中 かつ マウスボタン押下中ならば
		if (e.ctrlKey && e.buttons === 1) {
			const mousePoint = toWorld(
				e.clientX - (INTEGRATED_VIEWER_MENU_WIDTH + trainingModeMenuWidth),
				e.clientY - INTEGRATED_VIEWER_MAP_TITLEBAR_HEIGHT,
			);
			if (mousePoint == null) return;
			// 範囲選択中でないならば
			if (rectSelectingPointStart == null) {
				// 範囲選択開始
				setRectSelectingPointStart(new Point(mousePoint.x, mousePoint.y));
			}
			// 範囲選択終点更新
			setRectSelectingPointEnd(new Point(mousePoint.x, mousePoint.y));
			// ctrl押下中でない もしくは マウスボタン押下中でないならば
		} else {
			// 範囲選択解除
			setRectSelectingPointStart(undefined);
			setRectSelectingPointEnd(undefined);
		}
		// ctrl押下状態更新
		setIsRectSelecting(e.ctrlKey);
	};

	const onMouseUpCapture = (e: MouseEvent): void => {
		if (
			e.button !== 0 ||
			rectSelectingPointStart == null ||
			rectSelectingPointEnd == null
		) {
			return;
		}

		// 矩形範囲を算出
		const selectedRange: DisplayPoint = {
			canvasMinX: Math.min(rectSelectingPointStart.x, rectSelectingPointEnd.x),
			canvasMaxX: Math.max(rectSelectingPointStart.x, rectSelectingPointEnd.x),
			canvasMinY: Math.min(rectSelectingPointStart.y, rectSelectingPointEnd.y),
			canvasMaxY: Math.max(rectSelectingPointStart.y, rectSelectingPointEnd.y),
		};

		const drawsFovInfos = hasPickedImageIds
			? sFovThumbnailDrawInfos.filter((e) =>
					pickedFovImageIdList.includes(e.imageid),
				)
			: sFovThumbnailDrawInfos;

		// 範囲内sFOVのimageId取得
		const addImageIdList = drawsFovInfos
			.filter((e): boolean => {
				return (
					selectedRange.canvasMinX < e.mfovImagePoints.x + e.width &&
					e.mfovImagePoints.x < selectedRange.canvasMaxX &&
					selectedRange.canvasMinY < e.mfovImagePoints.y + e.height &&
					e.mfovImagePoints.y < selectedRange.canvasMaxY
				);
			})
			.map((e): number => e.imageid);

		// 範囲内sFOVを選択状態に追加
		addById(addImageIdList);

		// 範囲選択解除
		setRectSelectingPointStart(undefined);
		setRectSelectingPointEnd(undefined);
	};

	return {
		isRectSelecting,
		onMouseMoveCapture,
		onMouseUpCapture,
		rectSelectingPointStart,
		rectSelectingPointEnd,
	};
};
