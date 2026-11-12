import { memo, useEffect, useRef, useState } from "react";

import { DOMAIN_API } from "~/config";
import { useResultsRecord } from "~/features/misc/hooks/useResultName";

import { useSFovView } from "~/features/s-fov-image/hooks/useSFovView";
import { useMfovnoForSEMImage, useSfovnoForSEMImage } from "../hooks";

interface SFovMapProp {
	mapAreaWidth: number;
	mapAreaHeight: number;
}

export const SFovMap = ({
	mapAreaWidth,
	mapAreaHeight,
}: SFovMapProp): JSX.Element => {
	const { resultsRecord } = useResultsRecord();
	const { mfovnoForSEMImage } = useMfovnoForSEMImage();
	const { sfovnoForSEMImage } = useSfovnoForSEMImage();

	const { scale, position, sFovSize, containerSize, setPosition } =
		useSFovView();

	const divRef = useRef<HTMLDivElement>(null);

	const [isDragging, setIsDragging] = useState(false);
	// ドラッグ開始時のマップ上のマウス座標と、sFovコンテナの座標
	const [dragStart, setDragStart] = useState<{
		mouseX: number;
		mouseY: number;
		initialLeft: number;
		initialTop: number;
	} | null>(null);

	// TestRun画面の場合は mapAreaHeight が未設定なので sFovサイズから計算する
	const calcedHeight =
		mapAreaHeight > 0 || sFovSize.height === 0 || sFovSize.width === 0
			? mapAreaHeight
			: sFovSize.height * (mapAreaWidth / sFovSize.width);

	// SEM画像の実サイズと表示しているDOM要素サイズからMap表示倍率を計算
	const scaleRatioW = sFovSize.width > 0 ? mapAreaWidth / sFovSize.width : 1;
	const scaleRatioH = sFovSize.height > 0 ? calcedHeight / sFovSize.height : 1;

	// フレームの枠はコンテナに合わせて object-fit: contain で縮小しているので
	// それに合わせて幅/高さ倍率の小さいほうを使って計算する
	const frameScale = Math.min(scaleRatioH, scaleRatioW);
	const frameWidth =
		Math.min(containerSize.width / scale, sFovSize.width) * frameScale;
	const frameHeight =
		Math.min(containerSize.height / scale, sFovSize.height) * frameScale;

	const frameTop = (() => {
		if (position.top === 0) return 0;
		if (
			position.top < 0 ||
			position.top + sFovSize.height * scale > containerSize.height
		) {
			return (-position.top / scale) * scaleRatioH;
		}
		return 0;
	})();
	const frameLeft = (() => {
		if (position.left === 0) return 0;
		if (
			position.left < 0 ||
			position.left + sFovSize.width * scale > containerSize.width
		) {
			return (-position.left / scale) * scaleRatioW;
		}
		return 0;
	})();

	useEffect(() => {
		if (divRef.current == null) return;
		if (!isDragging || !dragStart) return;

		const handleMouseMove = (e: MouseEvent) => {
			e.preventDefault();
			const deltaMouseX = e.clientX - dragStart.mouseX;
			const deltaMouseY = e.clientY - dragStart.mouseY;

			// フレームの移動量を、SFovViewのpositionの移動量に変換
			// deltaMouseX / scaleRatio は、マップ座標系での移動量
			// これに SFovView の scale を掛けることで、SFovView の position の変化量になる
			// フレームが右に動く (deltaMouseX > 0) と、コンテンツは左に動く (position.left が減る)
			const left = dragStart.initialLeft - (deltaMouseX / scaleRatioW) * scale;
			const top = dragStart.initialTop - (deltaMouseY / scaleRatioH) * scale;

			setPosition({ left, top });
		};

		const handleMouseUp = (e: MouseEvent) => {
			e.preventDefault();
			setIsDragging(false);
			setDragStart(null);
		};

		divRef.current.addEventListener("mousemove", handleMouseMove);
		divRef.current.addEventListener("mouseup", handleMouseUp);
		divRef.current.addEventListener("mouseleave", handleMouseUp);

		return () => {
			if (divRef.current != null) {
				divRef.current.removeEventListener("mousemove", handleMouseMove);
				divRef.current.removeEventListener("mouseup", handleMouseUp);
				divRef.current.removeEventListener("mouseleave", handleMouseUp);
			}
		};
	}, [isDragging, dragStart, scale, scaleRatioW, scaleRatioH, setPosition]);

	// マップクリックイベント(フレーム以外の部分)
	const handleClickOnMap = (e: React.MouseEvent<HTMLDivElement>) => {
		// クリックされた要素がフレーム要素であれば何もしない
		if ((e.target as HTMLElement).closest('[data-testid="map-frame"]')) {
			return;
		}
		// マップ内クリック座標を取得
		// e.currentTarget を基準にするために getBoundingClientRect を使用
		const rect = e.currentTarget.getBoundingClientRect();
		const clickMiniMapX = e.clientX - rect.left;
		const clickMiniMapY = e.clientY - rect.top;

		// マップ座標を MainViewer のコンテンツ座標に変換
		const targetContentX = clickMiniMapX / scaleRatioW;
		const targetContentY = clickMiniMapY / scaleRatioH;

		// クリックされたコンテンツ座標が MainViewer の中心に来るような新しい position を計算
		const left = containerSize.width / 2 - targetContentX * scale;
		const top = containerSize.height / 2 - targetContentY * scale;

		setPosition({ left, top });
	};

	// マップクリックイベント(フレーム部分)
	const handleMouseDownOnFrame = (e: React.MouseEvent) => {
		e.preventDefault();
		e.stopPropagation();
		setIsDragging(true);
		setDragStart({
			mouseX: e.clientX,
			mouseY: e.clientY,
			initialLeft: position.left,
			initialTop: position.top,
		});
	};

	const srcSem =
		resultsRecord.toolData !== "" && mfovnoForSEMImage && sfovnoForSEMImage
			? `${DOMAIN_API}/tool-data/${resultsRecord.toolData}/${mfovnoForSEMImage}-${sfovnoForSEMImage}-sem.bmp`
			: undefined;

	return (
		<div
			style={{
				width: mapAreaWidth,
				height: calcedHeight,
				position: "relative",
				overflow: "hidden",
			}}
		>
			<div
				ref={divRef}
				style={{ height: "100%", width: "100%", position: "absolute" }}
				onClick={handleClickOnMap}
			>
				<img
					alt="image not found"
					src={srcSem}
					style={{
						position: "absolute",
						width: "100%",
						height: "100%",
						objectFit: "contain",
						objectPosition: "top left",
						pointerEvents: "none",
						userSelect: "none",
					}}
				/>
				<div
					data-testid="map-frame"
					style={{
						position: "absolute",
						top: frameTop,
						left: frameLeft,
						width: frameWidth,
						height: frameHeight,
						borderStyle: "solid",
						borderColor: "green",
						borderWidth: "3px",
						userSelect: "none",
					}}
					onMouseDown={handleMouseDownOnFrame}
				/>
			</div>
		</div>
	);
};

/**
 * 直接memo化するとオブジェクト扱いでユニットテストでspyOnが使えなくなるため \
 * 別コンポーネントとして用意
 * これを呼び出す側のユニットテストは vi.mock で対応
 */
export const MemorizedSFovMap = memo(
	({ mapAreaWidth, mapAreaHeight }: SFovMapProp) => {
		return (
			<SFovMap mapAreaWidth={mapAreaWidth} mapAreaHeight={mapAreaHeight} />
		);
	},
);
