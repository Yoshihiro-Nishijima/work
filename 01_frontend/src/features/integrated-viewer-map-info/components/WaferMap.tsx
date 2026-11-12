import { Box } from "@mui/material";
import { Point } from "pixi.js";
import { useCallback, useEffect, useRef } from "react";

import { IS_CHIP_EXIST } from "~/config";
import { useMapSelectionStatus } from "~/features/misc/hooks/useMapSelectionStatus";

import { useChipDefects, useIdw } from "../../map/hooks";
import type { Idw } from "../../map/types";

// 現時点ではエリアは正方形固定(将来的にはデータに応じて可変になるかも)
export const WAFERMAP_AREA_HEIGHT = 200;
export const WAFERMAP_AREA_WIDTH = 200;

// WaferMapエリアの短い方に合わせてWaferを描画する(はみ出さないように)
const CANVAS_SIZE = Math.min(WAFERMAP_AREA_HEIGHT, WAFERMAP_AREA_WIDTH);

// Chipなし領域の色(黒透過)
const NO_CHIP_COLOR = "rgba(0, 0, 0, 0.3)";
// データありChipの色
const DATA_CHIP_COLOR = "yellow";
// Wafer,Chipの枠線の色
const STROKE_COLOR = "black";
// 選択中Chipの色
const SELECTED_CHIP_COLOR = "lime";
// 選択中Chipの枠線の色
const SELECTED_CHIP_STROKE_COLOR = "green";

/* WaferMap 描画情報定義(統合Viewer画面用) */
export const WaferMap = (): JSX.Element => {
	const { idw, toDrawChipIndex } = useIdw();
	const { enableChipSet } = useChipDefects();

	const { selectedChipIndex } = useMapSelectionStatus();

	const waferCanvasRef = useRef<HTMLCanvasElement>(null);
	const chipCanvasRef = useRef<HTMLCanvasElement>(null);

	// WaferMap描画処理
	const drawCanvas = useCallback(
		(
			waferCanvas: HTMLCanvasElement,
			chipCanvas: HTMLCanvasElement,
			idw: Idw,
			selectedChipIndex: Point,
			enableChipSet: Set<string>,
		): void => {
			const waferCtx = waferCanvas.getContext("2d");
			if (waferCtx == null) return;
			const chipCtx = chipCanvas.getContext("2d");
			if (chipCtx == null) return;

			const chipPixX = CANVAS_SIZE / idw.chipArray.x;
			const chipPixY = CANVAS_SIZE / idw.chipArray.y;

			waferCanvas.width = CANVAS_SIZE;
			waferCanvas.height = CANVAS_SIZE;
			chipCanvas.width = CANVAS_SIZE;
			chipCanvas.height = CANVAS_SIZE;

			// 円描画
			waferCtx.beginPath();
			waferCtx.arc(
				waferCanvas.width / 2,
				waferCanvas.height / 2,
				CANVAS_SIZE / 2,
				0,
				2 * Math.PI,
				false,
			);
			waferCtx.strokeStyle = STROKE_COLOR;
			waferCtx.stroke();

			// mapoffsetは減算するものであるため符号を補正(y軸については、idw座標系では下から描画するため打ち消しあって加算となるため補正無し）
			const mapOffset = new Point(
				-(idw.mapOffset.x / idw.chipPitch.x) * chipPixX,
				(idw.mapOffset.y / idw.chipPitch.y) * chipPixY,
			);
			idw.chipExist.forEach((value, index) => {
				for (let x = 0; x < value.length; x++) {
					if (value.charAt(x) === IS_CHIP_EXIST) {
						// defectCountMapのキーは原点が左上のCanvas座標
						if (!enableChipSet.has(`${x},${index}`)) {
							// データ無しチップは塗りつぶしなし
							continue;
						}
						// データ有チップ
						chipCtx.fillStyle = DATA_CHIP_COLOR;
						chipCtx.fillRect(
							chipPixX * x + mapOffset.x,
							chipPixY * index + mapOffset.y,
							chipPixX,
							chipPixY,
						);
					} else {
						// チップなし
						chipCtx.fillStyle = NO_CHIP_COLOR;
						chipCtx.fillRect(
							chipPixX * x + mapOffset.x,
							chipPixY * index + mapOffset.y,
							chipPixX,
							chipPixY,
						);
					}
				}
			});

			chipCtx.strokeStyle = STROKE_COLOR;
			// Chip境界線描画(横)
			for (let i = 0; i <= idw.chipArray.y; i++) {
				chipCtx.beginPath();
				chipCtx.moveTo(mapOffset.x, i * chipPixY + mapOffset.y);
				chipCtx.lineTo(CANVAS_SIZE + mapOffset.x, i * chipPixY + mapOffset.y);
				chipCtx.stroke();
			}

			// Chip境界線描画(縦)
			for (let i = 0; i <= idw.chipArray.x; i++) {
				chipCtx.beginPath();
				chipCtx.moveTo(i * chipPixX + mapOffset.x, mapOffset.y);
				chipCtx.lineTo(i * chipPixX + mapOffset.x, CANVAS_SIZE + mapOffset.y);
				chipCtx.stroke();
			}
			chipCtx.strokeRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

			// 選択されているチップを描画(塗りつぶし)
			if (selectedChipIndex == null) return;
			const drawChipIndex = toDrawChipIndex(selectedChipIndex);
			chipCtx.fillStyle = SELECTED_CHIP_COLOR;
			chipCtx.fillRect(
				chipPixX * drawChipIndex.x + mapOffset.x,
				chipPixY * drawChipIndex.y + mapOffset.y,
				chipPixX,
				chipPixY,
			);
			chipCtx.strokeStyle = SELECTED_CHIP_STROKE_COLOR;
			chipCtx.strokeRect(
				chipPixX * drawChipIndex.x + mapOffset.x,
				chipPixY * drawChipIndex.y + mapOffset.y,
				chipPixX,
				chipPixY,
			);
		},
		[toDrawChipIndex],
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
			selectedChipIndex,
			enableChipSet,
		);
	}, [idw, selectedChipIndex, enableChipSet, drawCanvas]);

	return (
		// absoluteを使用している都合上、Boxで囲まないと親要素で配置するときにきれいに並ばない
		<Box>
			<Box width={WAFERMAP_AREA_WIDTH} height={WAFERMAP_AREA_HEIGHT}>
				<canvas
					ref={waferCanvasRef}
					style={{ position: "absolute", zIndex: 1 }}
				/>
				<canvas
					ref={chipCanvasRef}
					style={{ position: "absolute", zIndex: 2 }}
				/>
			</Box>
		</Box>
	);
};
