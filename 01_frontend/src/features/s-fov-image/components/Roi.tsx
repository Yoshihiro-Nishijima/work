import { memo } from "react";
import type { DefectRecord } from "~/features/defect-list/types";
import { useDefectDisplay } from "~/features/display-setting/hooks/useDefectDisplay";
import type { DefectDisplayRow } from "~/features/display-setting/types";
import {
	calcDefectCenterPoint,
	useDefect,
} from "~/features/info-and-defect/hooks/useDefect";
import { useRoiViewProp } from "~/features/misc/hooks/useImageViewProp";
import { useReviewModal } from "~/features/training-mode-sfov-view/hooks/useReviewModal";

function defectToDiv(
	key: number,
	defect: DefectRecord,
	scale: number,
	borderColor: string,
	roiSize: number,
	roiHalfSize: number,
): JSX.Element {
	const center = calcDefectCenterPoint(defect);
	return (
		<div
			key={key}
			style={{
				position: "absolute",
				top: `${center.y * scale - roiHalfSize}px`,
				left: `${center.x * scale - roiHalfSize}px`,
				width: `${roiSize}px`,
				height: `${roiSize}px`,
				borderStyle: "solid",
				borderColor,
				borderWidth: "5px",
				pointerEvents: "none",
			}}
		/>
	);
}

interface RoiDefectsProps {
	defects: DefectRecord[];
	scale: number;
	defectDisplayRowList: DefectDisplayRow[];
}
const RoiDefects = memo((props: RoiDefectsProps) => {
	if (props.defects.length === 0) return <></>;
	return (
		<>
			{props.defects.map((defect, idx) =>
				defectToDiv(
					idx + 1,
					defect,
					props.scale,
					props.defectDisplayRowList[defect.caughtBy - 1]?.color,
					100,
					50,
				),
			)}
		</>
	);
});

interface RoiProps {
	top: number;
	left: number;
	width?: number;
	height?: number;
	scale: number;
	zIndex: number;
}
export const Roi = ({
	top,
	left,
	width,
	height,
	scale,
	zIndex,
}: RoiProps): JSX.Element => {
	const { showRoi } = useRoiViewProp();
	const { defectDisplayRowList } = useDefectDisplay();
	const { isReviewModalOpen } = useReviewModal();
	const { selectedDefect, defectList, filteredDefects } = useDefect();

	if (!showRoi) return <></>;

	const roiDefectList = isReviewModalOpen ? defectList : filteredDefects;

	return (
		<div
			style={{
				position: "absolute",
				top,
				left,
				width: (width ?? 0) * scale,
				height: (height ?? 0) * scale,
				overflow: "hidden",
				zIndex,
				pointerEvents: "none",
				userSelect: "none",
			}}
		>
			<RoiDefects
				defects={roiDefectList}
				scale={scale}
				defectDisplayRowList={defectDisplayRowList}
			/>
			{selectedDefect != null
				? defectToDiv(0, selectedDefect, scale, "gold", 80, 40)
				: null}
		</div>
	);
};
