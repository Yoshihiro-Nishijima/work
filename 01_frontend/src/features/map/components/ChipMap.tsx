import {
	useCallback,
	useEffect,
	useLayoutEffect,
	useMemo,
	useRef,
	useState,
} from "react";
import type { InspectionAreaDrawParam } from "~/features/integrated-viewer-map/types";
import { useSFovViewModal } from "~/features/integrated-viewer-sfov-view/hooks/useSFovViewModal";
import { useMapSelectionStatus } from "~/features/misc/hooks/useMapSelectionStatus";
import { clamp } from "~/utils/numUtils";
import { useIdw, useInspectionAreas } from "../hooks/useIdw";
import { useMFov } from "../hooks/useMFov";
import { useMfovnoForSEMImage } from "../hooks/useMfovnoForSEMImage";
import type { Idw, MFov } from "../types";

// ChipMap 定数
const DEFECT_THRESHOLD_1 = 1;
const DEFECT_THRESHOLD_2 = 10;

const ZOOM_SPEED = 1.15; // ズーム速度 1.15なら15%ずつ大きくなったり小さくなったりする
const SCALE_MIN = 0.00001;
const SCALE_MAX = 0.0005;

// [nm] をそのまま座標等に使うとピクセル数が多くなりすぎるため、
// RENDERING_FACTORで割った値を描画用の座標とする
const RENDERING_FACTOR = 1000;
// Chip, Inspection Area 外枠線幅 = 10000[nm]
// REDERING_FACTORで割って描画用の値にする
const STROKE_WIDTH = 10000 / RENDERING_FACTOR;

interface ChipMapProp {
	mapAreaWidth: number;
	mapAreaHeight: number;
}

export const ChipMap = ({
	mapAreaWidth,
	mapAreaHeight,
}: ChipMapProp): JSX.Element | undefined => {
	const { mFovList, findMFov } = useMFov();
	const { idw, toDrawChipIndex } = useIdw();
	const { mfovnoForSEMImage, setMfovnoForSEMImage } = useMfovnoForSEMImage();
	const selectedMFOV = findMFov(mfovnoForSEMImage);
	const { isSFovViewModalOpen } = useSFovViewModal();
	const { selectedChipIndex } = useMapSelectionStatus();
	const { inspectionAreas } = useInspectionAreas(
		toDrawChipIndex(selectedChipIndex),
	);

	const svgRef = useRef<SVGSVGElement>(null);

	const [center, setCenter] = useState({ x: 0, y: 0 }); // 表示中心 [nm]
	const [scale, setScale] = useState(0.0002); // 表示スケール [px/nm]
	const [isMouseDown, setIsMouseDown] = useState(false);

	useEffect(() => {
		if (mFovList == null) return;
		if (mFovList[0] == null) return;
		setCenter({ x: mFovList[0].mfovX, y: mFovList[0].mfovY });
	}, [mFovList]);

	const onMfovClicked = useCallback(
		(mfovNo: number): void => {
			if (isSFovViewModalOpen) return;

			setMfovnoForSEMImage(mfovNo);
		},
		[setMfovnoForSEMImage, isSFovViewModalOpen],
	);

	const mfovToSVG = useCallback(
		(mfov: MFov, selected: boolean): JSX.Element | undefined => {
			const onClick = (): void => {
				onMfovClicked(mfov.mfovNo);
			};

			const mfovSize = idw?.inspectionArea.find(
				(a) => a.no === mfov.areaNo,
			)?.mFOVSize;
			if (mfovSize == null) {
				return undefined;
			}

			let fill = "lightgray";
			if (mfov.defectNum >= DEFECT_THRESHOLD_2) {
				fill = "red";
			} else if (mfov.defectNum >= DEFECT_THRESHOLD_1) {
				fill = "yellow";
			}

			const translate = `${mfov.mfovX / RENDERING_FACTOR} ${-mfov.mfovY / RENDERING_FACTOR}`;
			const scale = `${(mfovSize.x * 1.01) / RENDERING_FACTOR} ${(mfovSize.y * 1.01) / RENDERING_FACTOR}`;

			return (
				<polygon
					key={`mfov-${mfov.mfovNo}`}
					// mfovの実際の寸法にスケールしたうえでmfovの位置にずらす
					transform={`translate(${translate}) scale(${scale})`}
					points="-0.25,-0.5 0.25,-0.5 0.5,0 0.25,0.5 -0.25,0.5 -0.5,0" // 高さ幅それぞれ1.0の六角形
					strokeWidth={selected ? 0.1 : 0.025}
					stroke={selected ? "green" : "black"}
					strokeOpacity={selected ? 1.0 : 0.5}
					fill={fill}
					fillOpacity={0.5}
					onClick={onClick}
				/>
			);
		},
		[idw?.inspectionArea, onMfovClicked],
	);

	const inspectionAreaToSVG = (ia: InspectionAreaDrawParam): JSX.Element => {
		return (
			<rect
				key={`ia-${ia.areaNo}`}
				x={ia.idwCoordinateMinX / RENDERING_FACTOR}
				y={-ia.idwCoordinateMaxY / RENDERING_FACTOR}
				width={(ia.idwCoordinateMaxX - ia.idwCoordinateMinX) / RENDERING_FACTOR}
				height={
					(ia.idwCoordinateMaxY - ia.idwCoordinateMinY) / RENDERING_FACTOR
				}
				stroke="red"
				strokeWidth={STROKE_WIDTH}
				fill="transparent"
				pointerEvents="none"
			/>
		);
	};

	const chipAreaToSVG = (idw: Idw): JSX.Element => {
		return (
			<rect
				x={0}
				y={-idw.chipPitch.y / RENDERING_FACTOR}
				width={idw.chipPitch.x / RENDERING_FACTOR}
				height={idw.chipPitch.y / RENDERING_FACTOR}
				stroke="black"
				strokeWidth={STROKE_WIDTH}
				fill="white"
				pointerEvents="none"
			/>
		);
	};

	const onWheel = isSFovViewModalOpen
		? undefined
		: (e: React.WheelEvent): void => {
				const prevScale = scale;

				if (svgRef.current === null) return;
				const svgPx = svgRef.current.getBoundingClientRect();
				const domPx = {
					x: e.clientX - svgPx.left - svgPx.width / 2,
					y: -(e.clientY - svgPx.top - svgPx.height / 2),
				};

				let nextScale = scale;
				if (e.deltaY < 0) {
					nextScale *= ZOOM_SPEED;
				} else {
					nextScale /= ZOOM_SPEED;
				}
				const newScale = clamp(nextScale, SCALE_MIN, SCALE_MAX);
				const nextCenter = {
					x: center.x + domPx.x / prevScale - domPx.x / newScale,
					y: center.y + domPx.y / prevScale - domPx.y / newScale,
				};

				if (idw === undefined) return;
				const newCenter = {
					x: clamp(nextCenter.x, 0, idw.chipPitch.x),
					y: clamp(nextCenter.y, 0, idw.chipPitch.y),
				};
				setScale(newScale);
				setCenter(newCenter);
			};

	const onMouseDown = isSFovViewModalOpen
		? undefined
		: (_e: React.MouseEvent): void => {
				setIsMouseDown(true);
				document.onmouseup = onMouseUp;
				document.body.style.userSelect = "none";
			};

	const onMouseUp = (_e: MouseEvent): void => {
		document.onmousemove = null;
		document.body.style.userSelect = "";
		setIsMouseDown(false);
	};

	// center, scaleが更新されたらmousemoveイベントを登録する、もしくはしなおす
	useLayoutEffect(() => {
		if (isMouseDown) {
			document.onmousemove = (e: MouseEvent): void => {
				if (idw === undefined) return;

				setCenter({
					x: clamp(center.x - e.movementX / scale, 0, idw.chipPitch.x),
					y: clamp(center.y + e.movementY / scale, 0, idw.chipPitch.y),
				});
			};
		}
	}, [center, scale, isMouseDown, idw]);

	const viewBox =
		`${(center.x - mapAreaWidth / scale / 2) / RENDERING_FACTOR} ` +
		`${(-center.y - mapAreaHeight / scale / 2) / RENDERING_FACTOR} ` +
		`${mapAreaWidth / scale / RENDERING_FACTOR} ` +
		`${mapAreaHeight / scale / RENDERING_FACTOR}`;

	return (
		<svg
			ref={svgRef}
			viewBox={viewBox}
			style={{
				width: mapAreaWidth,
				height: mapAreaHeight,
				backgroundColor: "gray",
			}}
			onWheel={onWheel}
			onMouseDown={onMouseDown}
		>
			{idw != null ? chipAreaToSVG(idw) : undefined}
			{/* チップ境界 */}

			{/* mfovの六角形 */}
			{useMemo(() => {
				if (mFovList == null) return null;
				return mFovList.map((mfov) => mfovToSVG(mfov, false));
			}, [mFovList, mfovToSVG])}

			{selectedChipIndex && inspectionAreas.map(inspectionAreaToSVG)}
			{/* inspectionaArea境界 */}

			{selectedMFOV != null ? mfovToSVG(selectedMFOV, true) : undefined}
			{/* 選択中mfov */}
		</svg>
	);
};
