import { PixiComponent } from "@pixi/react";
import {
	type DisplayObject as PixiDisplayObject,
	Graphics as PixiGraphics,
	Point,
} from "pixi.js";
import {
	type Dispatch,
	type SetStateAction,
	Suspense,
	startTransition,
	useEffect,
	useMemo,
} from "react";
import { useMapSelectionStatus } from "~/features/misc/hooks/useMapSelectionStatus";
import { useSetSelectedDefect } from "~/features/misc/hooks/useSelectedDefect";
import { useContextMenuDisplay } from "../hooks/useContextMenuDisplay";
import { useDisplayedDefect } from "../hooks/useDisplayedDefect";
import { useEmphasisPoint } from "../hooks/useEmphasisPoint";
import { useMapDefectsInfo } from "../hooks/useMapDefectsInfo";
import { useDefectMapInfo } from "../hooks/useMapInfo";
import { usePinInfo } from "../hooks/usePinInfo";
import type { QuadTree } from "../utils/QuadTree";

export const DEFECT_GRAPHICS_NAME = "DefectGraphics";
/**
 * 欠陥点描画用パラメータ
 */
interface PixiComponentDefectProps {
	// Mapに描画する欠陥情報
	defectQuadTree: QuadTree;
	// 欠陥情報の描画範囲
	//defectBoundary: Rectangle;
	// 強調Defectの座標セッター
	setEmphasisPoint: Dispatch<SetStateAction<Point>>;
	// 半径
	radius: number;
	// ID指定の欠陥情報設定
	setSelectedDefectById: (defectId: number) => Promise<void>;
	// コンテキストメニュー表示許可
	setIsContextMenuDisplay: (value: boolean) => void;
	// コンテキストメニュー表示座標
	setContextMenuPoint: (Point: Point) => void;
}

const isPixiComponentDefectProps = (
	value: Readonly<object | PixiComponentDefectProps>,
): value is Readonly<PixiComponentDefectProps> => {
	return "radius" in value && "defectQuadTree" in value;
};

// 欠陥点表示
const DefectComponent = PixiComponent<
	PixiComponentDefectProps,
	PixiDisplayObject
>("Defect", {
	create: (_prop): PixiDisplayObject => {
		return new PixiGraphics() as PixiDisplayObject;
	},
	applyProps: (o, oldProps, props) => {
		const startedAt = performance.now();
		const g = o as PixiGraphics;
		const shouldFullRedraw =
			!isPixiComponentDefectProps(oldProps) ||
			oldProps.radius !== props.radius ||
			oldProps.defectQuadTree !== props.defectQuadTree;

		if (props.defectQuadTree.isEmpty()) {
			g.clear();
			g.name = "";
			props.defectQuadTree.clearDrawedDefectIds();
			console.log("[perf][Defect.applyProps] skipped empty quadtree", {
				durationMs: performance.now() - startedAt,
			});
			return g as PixiDisplayObject;
		}
		g.name = DEFECT_GRAPHICS_NAME;

		if (shouldFullRedraw) {
			g.clear();
			props.defectQuadTree.clearDrawedDefectIds();
		}
		//g.lineStyle(0, "red").beginFill("red");
		const defects = props.defectQuadTree.getAllDefects(false);

		const drawRegularPolygon = (
			centerX: number,
			centerY: number,
			radius: number,
			vertexCount: number,
			rotation = -Math.PI / 2,
		) => {
		const points: number[] = [];

			for (let index = 0; index < vertexCount; index++) {
				const angle =
					rotation + (Math.PI * 2 * index) / vertexCount;

				points.push(
					centerX + Math.cos(angle) * radius,
					centerY + Math.sin(angle) * radius,
			);
			}

			g.drawPolygon(points);
		};

		const drawStar = (
			centerX: number,
			centerY: number,
			outerRadius: number,
		) => {
			const points: number[] = [];
			const innerRadius = outerRadius * 0.45;

			for (let index = 0; index < 10; index++) {
				const radius =
					index % 2 === 0 ? outerRadius : innerRadius;
				const angle = -Math.PI / 2 + (Math.PI * index) / 5;

				points.push(
					centerX + Math.cos(angle) * radius,
					centerY + Math.sin(angle) * radius,
				);
			}

			g.drawPolygon(points);
		};

		for (const defect of defects) {
			const size = props.radius * 4;

			switch (defect.defectClass) {
				case 0:
					// 青い円
					g.beginFill(0x147dcc);
					g.drawCircle(defect.x, defect.y, size);
					g.endFill();
					break;

				case 1:
					// 黒い上向き三角形
					g.beginFill(0x000000);
					g.drawPolygon([
						defect.x,
						defect.y - size,
						defect.x - size,
						defect.y + size,
						defect.x + size,
						defect.y + size,
					]);
					g.endFill();
					break;
				case 2:
					// 黄緑色のひし形
					g.beginFill(0x8bdd65);
					g.drawPolygon([
						defect.x,
						defect.y - size,
						defect.x + size,
						defect.y,
						defect.x,
						defect.y + size,
						defect.x - size,
						defect.y,
					]);
					g.endFill();
					break;

				case 3:
					// 紫色の五角形
					g.beginFill(0xd452c4);
					drawRegularPolygon(
						defect.x,
						defect.y,
						size,
						5,
					);
					g.endFill();
					break;

				case 4:
					// オレンジ色の正方形
					g.beginFill(0xff8c00);
					g.drawRect(
						defect.x - size,
						defect.y - size,
						size * 2,
						size * 2,
					);
					g.endFill();
					break;

				case 5:
					// 水色の六角形
					g.beginFill(0x00bcd4);
					drawRegularPolygon(
						defect.x,
						defect.y,
						size,
						6,
					);
					g.endFill();
					break;

				case 6:
					// 赤い下向き三角形
					g.beginFill(0xe53935);
					g.drawPolygon([
						defect.x - size,
						defect.y - size,
						defect.x + size,
						defect.y - size,
						defect.x,
						defect.y + size,
					]);
					g.endFill();
					break;

				case 7:
					// 黄色の八角形
					g.beginFill(0xffd600);
					drawRegularPolygon(
						defect.x,
						defect.y,
						size,
						8,
					);
					g.endFill();
					break;

				case 8:
					// 青緑色の十字形
					g.beginFill(0x00897b);
					g.drawPolygon([
						defect.x - size * 0.35,
						defect.y - size,
						defect.x + size * 0.35,
						defect.y - size,
						defect.x + size * 0.35,
						defect.y - size * 0.35,
						defect.x + size,
						defect.y - size * 0.35,
						defect.x + size,
						defect.y + size * 0.35,
						defect.x + size * 0.35,
						defect.y + size * 0.35,
						defect.x + size * 0.35,
						defect.y + size,
						defect.x - size * 0.35,
						defect.y + size,
						defect.x - size * 0.35,
						defect.y + size * 0.35,
						defect.x - size,
						defect.y + size * 0.35,
						defect.x - size,
						defect.y - size * 0.35,
						defect.x - size * 0.35,
						defect.y - size * 0.35,
					]);
					g.endFill();
					break;

				case 9:
					// ピンク色の星形
					g.beginFill(0xff4081);
					drawStar(defect.x, defect.y, size);
					g.endFill();
					break;

				case 10:
					// 茶色の横長楕円
					g.beginFill(0x795548);
					g.drawEllipse(
						defect.x,
						defect.y,
						size,
						size * 0.55,
					);
					g.endFill();
					break;

				default:
					// 未定義カテゴリ
					g.beginFill(0x808080);
					g.drawCircle(
						defect.x,
						defect.y,
						size * 0.6,
					);
					g.endFill();
					break;
			}
			props.defectQuadTree.pushDrawedDefectId(defect.defectId);
		}
		console.log("[perf][Defect.applyProps] rendered", {
			defectCount: defects.length,
			radius: props.radius,
			durationMs: performance.now() - startedAt,
		});

		g.interactive = true;
		g.removeAllListeners();
		// 強調表示ON
		g.addEventListener("mouseenter", (event) => {
			const defect = props.defectQuadTree.getNearestPoint(
				event.getLocalPosition(g),
				props.radius * 8,
			);
			if (defect?.defectId) {
				startTransition(() => {
					props.setEmphasisPoint(new Point(defect.x, defect.y));
				});
			}
		});
		// 強調表示OFF
		g.addEventListener("mouseleave", (_) => {
			startTransition(() => {
				props.setEmphasisPoint(new Point(-1, -1));
			});
		});
		// 強調表示OFF、Defect選択
		g.addEventListener("mouseup", (event) => {
			const defect = props.defectQuadTree.getNearestPoint(
				event.getLocalPosition(g),
				props.radius * 8,
			);
			if (defect?.defectId) {
				startTransition(() => {
					void props.setSelectedDefectById(defect.defectId);
				});
			}
			props.setEmphasisPoint(new Point(-1, -1));
		});
		// 強調表示OFF、コンテキストメニュー表示
		g.addEventListener("rightup", (event) => {
			const defect = props.defectQuadTree.getNearestPoint(
				event.getLocalPosition(g),
				props.radius * 8,
			);
			if (defect?.defectId) {
				startTransition(() => {
					void props.setSelectedDefectById(defect.defectId);
				});
			}
			props.setIsContextMenuDisplay(true);
			props.setContextMenuPoint(new Point(event.x + 2, event.y - 6));
			props.setEmphasisPoint(new Point(-1, -1));
		});

		return g as PixiDisplayObject;
	},
});

export const Defect = ({
	suppressGlyphs = false,
}: {
	suppressGlyphs?: boolean;
}): JSX.Element => {
	const { isDisplayedDefect } = useDisplayedDefect();
	const { defectQuadTree } = useMapDefectsInfo(!isDisplayedDefect);
	const { setEmphasisPoint } = useEmphasisPoint();
	const { defectPointRadius: radius } = useDefectMapInfo();
	const { setPinPoint } = usePinInfo();
	const { setSelectedDefectById } = useSetSelectedDefect();
	const { selectedDefectPixelPoint } = useMapSelectionStatus();
	const { setIsContextMenuDisplay } = useContextMenuDisplay();
	const { setContextMenuPoint } = useContextMenuDisplay();

	useEffect(() => {
		if (!isDisplayedDefect || selectedDefectPixelPoint == null) {
			setPinPoint(undefined);
			return;
		}
		setPinPoint(
			new Point(selectedDefectPixelPoint.x, selectedDefectPixelPoint.y),
		);
		return () => {
			setPinPoint(undefined);
		};
	}, [isDisplayedDefect, setPinPoint, selectedDefectPixelPoint]);

	return useMemo(
		() =>
			isDisplayedDefect &&
				!suppressGlyphs &&
				defectQuadTree != null &&
				!defectQuadTree.isEmpty() ? (
				<Suspense>
					<DefectComponent
						defectQuadTree={defectQuadTree}
						setEmphasisPoint={setEmphasisPoint}
						radius={radius}
						setSelectedDefectById={setSelectedDefectById}
						setIsContextMenuDisplay={setIsContextMenuDisplay}
						setContextMenuPoint={setContextMenuPoint}
					/>
				</Suspense>
			) : (
				<></>
			),
		[
			isDisplayedDefect,
			suppressGlyphs,
			defectQuadTree,
			setEmphasisPoint,
			radius,
			setSelectedDefectById,
			setIsContextMenuDisplay,
			setContextMenuPoint,
		],
	);
};
