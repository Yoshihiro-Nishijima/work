import { useEffect, useRef, useState } from "react";
import { DOMAIN_API } from "~/config";
import {
	type showImageType,
	type showSEMType,
	useShowImage,
} from "~/features/misc/hooks/useImageViewProp";
import classes from "../css/style.module.css";
import { useReferenceOffset } from "../hooks/useReferenceOffset";

const generateSEMImageSrc = (
	{
		resultName,
		toolData,
		mfovno,
		sfovno,
		testRunId,
		testRunProcessedCount,
	}: SEMImageProps,
	showImage: showImageType,
	showSEM: showSEMType,
): string => {
	if (showImage === "none") return "";

	if (showImage === "sem") {
		if (mfovno <= 0 || sfovno <= 0) return "";
		if (showSEM === "target") {
			// SEM
			if (toolData === "") return "";
			return `${DOMAIN_API}/tool-data/${toolData}/${mfovno}-${sfovno}-sem.bmp`;
		}
		// reference1, reference2
		if (resultName === "") return "";
		return `${DOMAIN_API}/results/${resultName}/${mfovno}-${sfovno}-${showSEM}.bmp`;
	}

	// Test Run
	if (!resultName) return "";
	if (!testRunId) return "";

	if (showImage === "preprocessed-sem") {
		const name = showSEM === "target" ? showImage : `preprocessed-${showSEM}`;
		return `${DOMAIN_API}/test-run/${resultName}/${testRunId}/${name}.png?p=${testRunProcessedCount}`;
	}

	// potential, intermediate
	if (testRunProcessedCount < 1) return "";
	return `${DOMAIN_API}/test-run/${resultName}/${testRunId}/${showImage}.png?p=${testRunProcessedCount}`;
};

interface SEMImageProps {
	onload: (width: number, height: number) => void;
	setErrorMsg: (errMsg?: string) => void;
	resultName: string;
	toolData: string;
	mfovno: number;
	sfovno: number;
	testRunId: string;
	testRunProcessedCount: number;
	zIndex: number;
}
export const SEMImage = (props: SEMImageProps): JSX.Element => {
	const { showImageType, showSEMType, semAlpha } = useShowImage();
	const semImageRef = useRef<HTMLImageElement>(null);
	const { offsetX, offsetY, errMsg } = useReferenceOffset(
		props.resultName,
		props.mfovno,
		props.sfovno,
		showSEMType,
		props.testRunId,
		props.testRunProcessedCount,
	);
	const [referenceOffset, setReferenceOffset] = useState({ x: 0, y: 0 });

	// ref1,2 の場合はオフセットを設定
	useEffect(() => {
		if (semImageRef.current === null) return;
		if (showImageType !== "sem" || showSEMType === "target" || errMsg === "") {
			setReferenceOffset({ x: offsetX, y: offsetY });
			props.setErrorMsg(undefined);
			semImageRef.current.style.display = "block";
		} else {
			props.setErrorMsg(errMsg);
			semImageRef.current.style.display = "none";
		}
	}, [showImageType, showSEMType, errMsg, offsetX, offsetY, props.setErrorMsg]);

	const src = generateSEMImageSrc(props, showImageType, showSEMType);
	if (src === "") return <></>;

	const semOpacity = (100.0 - semAlpha) / 100.0;

	const handleOnLoadImage = (): void => {
		if (semImageRef.current === null) return;
		props.onload(semImageRef.current.width, semImageRef.current.height);
	};

	return (
		<div
			style={{
				backgroundColor: "black",
				position: "absolute",
				height: semImageRef.current?.height,
				width: semImageRef.current?.width,
				overflow: "hidden",
			}}
		>
			<img
				ref={semImageRef}
				alt="image not found"
				src={src}
				className={classes.pixelated}
				style={{
					top: `${referenceOffset.y}px`,
					left: `${referenceOffset.x}px`,
					position: "absolute",
					opacity: semOpacity,
					display: "block",
					pointerEvents: "none",
					zIndex: props.zIndex,
				}}
				onLoad={handleOnLoadImage}
			/>
		</div>
	);
};
