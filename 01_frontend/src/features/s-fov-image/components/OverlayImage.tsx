import { useMemo } from "react";
import { DOMAIN_API } from "~/config";
import {
	useBoxSegmentViewProp,
	useDefectOverlayViewProp,
	useDesignViewProp,
} from "~/features/misc/hooks/useImageViewProp";
import classes from "../css/style.module.css";
import { useDefectImage } from "../hooks/useDefectImage";
import { useOverlayImage } from "../hooks/useOverlayImage";

interface OverlayImageProp {
	resultName: string;
	mFovNo: number;
	sFovNo: number;
	testRunId: string;
	testRunProcessedCount: number;
	defectIndex: number;
	boxSegmentIndex: number;
	designIndex: number;
}
export const OverlayImage = ({
	resultName,
	mFovNo,
	sFovNo,
	testRunId,
	testRunProcessedCount,
	defectIndex,
	boxSegmentIndex,
	designIndex,
}: OverlayImageProp): JSX.Element => {
	const { showDefect, defectAlpha } = useDefectOverlayViewProp();
	const { showBoxSegmentData } = useBoxSegmentViewProp();
	const { showDesignData } = useDesignViewProp();
	const isTestRun = testRunId !== "" && testRunProcessedCount > 0;

	const overlayImgURL = isTestRun
		? `${DOMAIN_API}/test-run/${resultName}/${testRunId}/overlay.png?p=${testRunProcessedCount}`
		: `${DOMAIN_API}/results/${resultName}/${mFovNo}-${sFovNo}-overlay.png?`;
	const { defectImgURL, designImgURL, boxSegmentImgURL, size } =
		useOverlayImage(overlayImgURL);

	// TestRun実行時の defect画像URL
	const defectOverlayImgURL = isTestRun
		? `${DOMAIN_API}/test-run/${resultName}/${testRunId}/defects.bmp?p=${testRunProcessedCount}`
		: "";
	const { defectImgURL: testRunDefectImgURL, size: testRunDefectSize } =
		useDefectImage(defectOverlayImgURL);

	// Defect透過率(0.0-1.0)
	const defectOpacity = useMemo(
		() => (100.0 - defectAlpha) / 100.0,
		[defectAlpha],
	);

	return (
		<>
			{/* Defect */}
			<img
				className={classes.pixelated}
				src={isTestRun ? testRunDefectImgURL : defectImgURL}
				hidden={!showDefect}
				style={{
					top: 0,
					left: 0,
					height: isTestRun ? testRunDefectSize.height : size.height,
					width: isTestRun ? testRunDefectSize.width : size.width,
					position: "absolute",
					opacity: defectOpacity,
					zIndex: defectIndex,
					pointerEvents: "none",
				}}
			/>
			{/* BoxSegment */}
			<img
				className={classes.auto}
				src={boxSegmentImgURL}
				hidden={!showBoxSegmentData}
				style={{
					top: 0,
					left: 0,
					height: size.height,
					width: size.width,
					position: "absolute",
					zIndex: boxSegmentIndex,
					pointerEvents: "none",
				}}
			/>
			{/* Design */}
			<img
				className={classes.auto}
				src={designImgURL}
				hidden={!showDesignData}
				style={{
					top: 0,
					left: 0,
					height: size.height,
					width: size.width,
					position: "absolute",
					zIndex: designIndex,
					pointerEvents: "none",
				}}
			/>
		</>
	);
};
