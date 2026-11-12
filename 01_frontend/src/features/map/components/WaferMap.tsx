import { Box } from "@mui/material";
import { Point } from "pixi.js";
import { useCallback, useEffect, useRef } from "react";

import { IS_CHIP_EXIST } from "~/config";
import { useSelectedChipValue } from "~/features/misc/hooks/useMapSelectionStatus";

import { useChipDefects, useIdw, useWaferMap } from "../hooks";
import type { Idw } from "../types";

interface WaferMapProp {
	mapAreaWidth: number;
	mapAreaHeight: number;
}
/* WaferMap 描画情報定義(ResultViewer画面用) */
export const WaferMap = ({
	mapAreaWidth,
	mapAreaHeight,
}: WaferMapProp): JSX.Element => {
	const { updateSelectedChip } = useWaferMap();
	const { enableChipSet } = useChipDefects();
	const selectedChip = useSelectedChipValue();
	const { idw, toDrawChipIndex } = useIdw();

	const waferCanvasRef = useRef<HTMLCanvasElement>(null);
	const chipCanvasRef = useRef<HTMLCanvasElement>(null);

	// WaferMap描画処理
	const drawCanvas = useCallback(
		(
			waferCanvas: HTMLCanvasElement,
			chipCanvas: HTMLCanvasElement,
			idw: Idw | undefined,
			selectedChip: Point | undefined,
			enableChipSet: Set<string>,
		): void => {
			if (idw == null) return;

			const waferCtx = waferCanvas.getContext("2d");
			if (waferCtx == null) return;
			const chipCtx = chipCanvas.getContext("2d");
			if (chipCtx == null) return;

			const canvasSize = Math.min(mapAreaHeight, mapAreaWidth);

			const chipPixX = canvasSize / idw.chipArray.x;
			const chipPixY = canvasSize / idw.chipArray.y;

			waferCanvas.width = canvasSize;
			waferCanvas.height = canvasSize;
			chipCanvas.width = canvasSize;
			chipCanvas.height = canvasSize;

			// 円描画
			waferCtx.beginPath();
			waferCtx.arc(
				canvasSize / 2,
				canvasSize / 2,
				canvasSize / 2,
				0,
				2 * Math.PI,
				false,
			);
			waferCtx.strokeStyle = "black";
			waferCtx.stroke();

			const arrayY = idw.chipArray.y;
			idw.chipExist.forEach((value, index) => {
				const y = arrayY - index - 1;
				for (let x = 0; x < value.length; x++) {
					if (value.charAt(x) === IS_CHIP_EXIST) {
						if (!enableChipSet.has(`${x},${index}`)) {
							// データ無しチップは塗りつぶしなし
							continue;
						}
						// データ有チップは黄色
						chipCtx.fillStyle = "yellow";
						chipCtx.fillRect(
							chipPixX * x,
							chipPixY * index,
							chipPixX,
							chipPixY,
						);
					} else {
						// チップなしの場所は黒透過
						chipCtx.fillStyle = "rgba(0, 0, 0, 0.3)";
						chipCtx.fillRect(
							chipPixX * x,
							chipPixY * index,
							chipPixX,
							chipPixY,
						);
					}
				}
			});

			chipCtx.strokeStyle = "black";
			for (let i = 1; i < idw.chipArray.y; i++) {
				chipCtx.beginPath();
				chipCtx.moveTo(0, i * chipPixY);
				chipCtx.lineTo(canvasSize, i * chipPixY);
				chipCtx.stroke();
			}
			for (let i = 1; i < idw.chipArray.x; i++) {
				chipCtx.beginPath();
				chipCtx.moveTo(i * chipPixX, 0);
				chipCtx.lineTo(i * chipPixX, canvasSize);
				chipCtx.stroke();
			}
			chipCtx.strokeRect(0, 0, canvasSize, canvasSize);

			// 選択されているチップを描画
			if (selectedChip == null) return;
			const chipCoordOrigin = toDrawChipIndex(selectedChip);
			chipCtx.fillStyle = "lime";
			chipCtx.fillRect(
				chipPixX * chipCoordOrigin.x,
				chipPixY * chipCoordOrigin.y,
				chipPixX,
				chipPixY,
			);
			chipCtx.strokeStyle = "green";
			chipCtx.strokeRect(
				chipPixX * chipCoordOrigin.x,
				chipPixY * chipCoordOrigin.y,
				chipPixX,
				chipPixY,
			);
		},
		[toDrawChipIndex, mapAreaHeight, mapAreaWidth],
	);

	// IDW描画更新処理
	useEffect(() => {
		if (
			idw == null ||
			waferCanvasRef.current == null ||
			chipCanvasRef.current == null
		) {
			return;
		}
		drawCanvas(
			waferCanvasRef.current,
			chipCanvasRef.current,
			idw,
			selectedChip,
			enableChipSet,
		);
	}, [idw, selectedChip, enableChipSet, drawCanvas]);

	// クリックイベントハンドラー
	const onClickChip: React.MouseEventHandler<HTMLCanvasElement> = (e) => {
		if (idw == null) return;
		if (chipCanvasRef.current == null) return;
		const canvas = chipCanvasRef.current;

		// クリック位置を取得
		const rect = canvas.getBoundingClientRect();
		const point = {
			x: e.clientX - rect.left,
			y: e.clientY - rect.top,
		};

		// 選択Chip座標更新処理
		const chipPixX = canvas.width / idw.chipArray.x;
		const chipPixY = canvas.height / idw.chipArray.y;
		const x = Math.floor(point.x / chipPixX);
		const y = Math.floor(point.y / chipPixY);
		updateSelectedChip(new Point(x, y));
	};

	return (
		<Box width={mapAreaWidth} height={mapAreaHeight}>
			<canvas
				ref={waferCanvasRef}
				style={{ position: "absolute", zIndex: 1 }}
				data-testid="WaferCanvas"
			/>
			<canvas
				ref={chipCanvasRef}
				onClick={onClickChip}
				style={{ position: "absolute", zIndex: 2 }}
				data-testid="ChipCanvas"
			/>
		</Box>
	);
};
