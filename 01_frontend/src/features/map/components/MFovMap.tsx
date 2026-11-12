import { useCallback, useRef } from "react";

import { DOMAIN_API } from "~/config";
import { useResultsRecord } from "~/features/misc/hooks/useResultName";

import type { Size } from "~/features/misc/types";
import { useMfovnoForSEMImage, useSFovs, useSfovnoForSEMImage } from "../hooks";
import { useMps } from "../hooks/useMps";

const sFovMax = 91;
const indexList = [...Array(sFovMax)];
const sFovArrayX = [6, 7, 8, 9, 10, 11, 10, 9, 8, 7, 6];
const maxArraySize = Math.max(...sFovArrayX);
const sFovLineWidth = 2;

interface MFovMapProp {
	mapAreaWidth: number;
	mapAreaHeight: number;
}

export const MFovMap = ({
	mapAreaWidth,
	mapAreaHeight,
}: MFovMapProp): JSX.Element => {
	const panelRef = useRef<HTMLDivElement>(null);

	const { resultsRecord } = useResultsRecord();
	const { mfovnoForSEMImage } = useMfovnoForSEMImage();
	const { sfovnoForSEMImage, setSfovnoForSEMImage } = useSfovnoForSEMImage();
	const { mps } = useMps();
	const { sFovList } = useSFovs();

	const getPanelVisibleArea = useCallback((): Size => {
		return {
			width: mapAreaWidth,
			height: mapAreaHeight,
		};
	}, [mapAreaHeight, mapAreaWidth]);

	const getMfovSize = useCallback((): Size | undefined => {
		if (mps == null) return;

		return {
			width: mps.fovWidth * 1000 * maxArraySize,
			height: mps.fovHeight * 1000 * maxArraySize,
		};
	}, [mps]);

	// nm -> pix
	const getMagNmToPixel = useCallback((): number | undefined => {
		const panelSize = getPanelVisibleArea();
		const mfovSize = getMfovSize();

		if (mps == null || mfovSize == null) return;

		return Math.min(
			panelSize.width / mfovSize.width,
			panelSize.height / mfovSize.height,
		);
	}, [mps, getPanelVisibleArea, getMfovSize]);

	const getSfovDispSize = useCallback((): Size | undefined => {
		const mag = getMagNmToPixel();

		if (mps == null || mag == null) return;

		return {
			width: mps.fovWidth * 1000 * mag,
			height: mps.fovHeight * 1000 * mag,
		};
	}, [mps, getMagNmToPixel]);

	const ThumbnailSFovs = (): Array<JSX.Element | undefined> => {
		if (resultsRecord.toolData === "" || mps == null || sFovList == null) {
			return [];
		}

		const mfovSize = getMfovSize();
		const mag = getMagNmToPixel();
		const sfovDispSize = getSfovDispSize();
		if (
			mfovSize == null ||
			mag == null ||
			sfovDispSize == null ||
			mfovnoForSEMImage == null ||
			mfovnoForSEMImage <= 0
		) {
			return [];
		}

		return indexList.map((_value, index) => {
			if (sFovList[index] == null) return undefined;
			const selected = sfovnoForSEMImage === sFovList[index].sfovNo;
			return (
				<img
					key={`${mfovnoForSEMImage}-${sFovList[index].sfovNo}`}
					src={`${DOMAIN_API}/tool-data/${resultsRecord.toolData}/${mfovnoForSEMImage}-${sFovList[index].sfovNo}-sem.png`}
					style={{
						position: "absolute",
						width: sfovDispSize.width,
						height: sfovDispSize.height,
						top:
							(-sFovList[index].y + mfovSize.height / 2) * mag -
							sfovDispSize.height / 2,
						left:
							(sFovList[index].x + mfovSize.width / 2) * mag -
							sfovDispSize.width / 2,
						border: selected ? `${sFovLineWidth}px green solid` : "",
						zIndex: selected ? 1 : 0,
						userSelect: "none",
					}}
					draggable={false}
					onClick={() => {
						setSfovnoForSEMImage(sFovList[index].sfovNo);
					}}
				/>
			);
		});
	};

	return (
		<div
			style={{
				width: mapAreaWidth,
				height: mapAreaHeight,
				position: "relative",
			}}
			ref={panelRef}
		>
			<ThumbnailSFovs />
		</div>
	);
};
