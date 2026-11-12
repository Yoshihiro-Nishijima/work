import { atom, useAtom, useAtomValue } from "jotai";
import { useAtomCallback } from "jotai/utils";
import { type RefObject, useCallback, useEffect, useRef } from "react";
import type { Position, Size } from "~/features/misc/types";
import { clamp } from "~/utils/numUtils";

export const MAX_SCALE = 30;
export const MIN_SCALE = 0.1;

// sFovビューの拡大率
const scaleAtom = atom(0.2);
// sFovビューの位置(top-left)
const positionAtom = atom<Position>({ top: 0, left: 0 });
// sFovビュー配置コンテナ(div)の参照
const containerRefAtom = atom<RefObject<HTMLDivElement> | undefined>(undefined);
// sFovビュー配置コンテナ(div)のサイズ(動的に変わるのでイベントハンドラで更新)
const containerSizeAtom = atom<Size>({ width: 0, height: 0 });
// SEM画像サイズ
const sFovSizeAtom = atom<Size>({ width: 0, height: 0 });

interface UseSFovView {
	scale: number;
	position: Position;
	containerSize: Size;
	sFovSize: Size;
	setContainerRef: (ref: RefObject<HTMLDivElement>) => void;
	setContainerSize: (size: Size) => void;
	setSFovSize: (size: Size) => void;
	updateScaleAndPosition: (
		newScale: number,
		centerX?: number,
		centerY?: number,
	) => void;
	setPosition: (position: Position) => void;
}
/**
 * SFovView関連の状態管理
 * SFov自体の状態(fovNo等)は別
 */
export const useSFovView = (): UseSFovView => {
	const [scale, setScale] = useAtom(scaleAtom);
	const position = useAtomValue(positionAtom);
	const [containerSize, setContainerSize] = useAtom(containerSizeAtom);
	const [containerRef, setContainerRef] = useAtom(containerRefAtom);
	const [sFovSize, setSFovSize] = useAtom(sFovSizeAtom);

	// 最新値を保持するための ref
	// イベントハンドラ内で最新のstateを参照するために使用
	const scaleRef = useRef(scale);
	const positionRef = useRef(position);
	const containerSizeRef = useRef(containerSize);
	useEffect(() => {
		scaleRef.current = scale;
	}, [scale]);

	useEffect(() => {
		positionRef.current = position;
	}, [position]);

	useEffect(() => {
		containerSizeRef.current = containerSize;
	}, [containerSize]);

	const setPosition = useAtomCallback(
		useCallback((get, set, newPosition: Position) => {
			// Positionは、ContainerSizeの半分以上が表示されるように制限を設ける
			// 最小は、sFovの右端がContainerSizeの中央以下
			// 最大はContainerSizeの中央以下
			const containerSize = get(containerSizeAtom);
			const scale = get(scaleAtom);
			const sFovSize = get(sFovSizeAtom);
			const top = clamp(
				newPosition.top,
				containerSize.height / 2 - sFovSize.height * scale,
				containerSize.height / 2,
			);
			const left = clamp(
				newPosition.left,
				containerSize.width / 2 - sFovSize.width * scale,
				containerSize.width / 2,
			);
			set(positionAtom, { top, left });
		}, []),
	);

	/**
	 * scale変更時は位置も調整
	 * @param newScale: scale設定値
	 * @param centerX: scale変更中央座標X. 未指定時はコンテナの中央
	 * @param centerY: scale変更中央座標Y. 未指定時はコンテナの中央
	 */
	const updateScaleAndPosition = useCallback(
		(newScale: number, centerX?: number, centerY?: number) => {
			if (containerRef?.current == null) return;

			const container = containerRef.current;
			const currentScale = scaleRef.current;
			const currentPosition = positionRef.current;
			const newValidatedScale = clamp(newScale, MIN_SCALE, MAX_SCALE);

			if (newValidatedScale !== currentScale) {
				const actualDelta = newValidatedScale / currentScale;
				// ズームの基準値が指定されてなければコンテナの中央を基準として位置調整
				const calculatedNewPosition = {
					top:
						(centerY ?? container.clientHeight / 2) -
						((centerY ?? container.clientHeight / 2) - currentPosition.top) *
							actualDelta,
					left:
						(centerX ?? container.clientWidth / 2) -
						((centerX ?? container.clientWidth / 2) - currentPosition.left) *
							actualDelta,
				};

				setScale(newValidatedScale);
				setPosition(calculatedNewPosition);
			} else if (newScale !== currentScale) {
				setScale(newValidatedScale);
			}
		},
		[containerRef, setPosition, setScale],
	);

	return {
		scale,
		position,
		containerSize,
		sFovSize,
		setContainerRef,
		setContainerSize,
		setSFovSize,
		updateScaleAndPosition,
		setPosition,
	};
};
