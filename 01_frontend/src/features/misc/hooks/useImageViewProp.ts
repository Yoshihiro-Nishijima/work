import { atom, useAtom, useAtomValue, useSetAtom } from "jotai";
import { selectAtom, useAtomCallback } from "jotai/utils";
import { useCallback, useEffect } from "react";

import { type ImageViewProps, defaultImageView } from "../types/index";
import { useResultJobType } from "./useResultsJobType";

const imageViewPropsAtom = atom(defaultImageView);

// SEMImage表示関連
const showSEMTypeList = ["target", "ref1", "ref2"] as const;
export type showSEMType = (typeof showSEMTypeList)[number];
const showSEMTypeAtom = atom<showSEMType>("target");

const showImageTypeList = [
	"sem",
	"preprocessed-sem",
	"potential",
	"intermediate",
	"none",
] as const;
export type showImageType = (typeof showImageTypeList)[number];
const showImageTypeAtom = atom<showImageType>("sem");
const semAlphaAtom = selectAtom(imageViewPropsAtom, (p) => p.semAlpha);

export interface UseShowImage {
	isHiddenSem: boolean;
	isHiddenPotential: boolean;
	isHiddenIntermediate: boolean;
	showImageType: showImageType;
	setShowImage: (showImage: string) => void;
	showSEMType: showSEMType;
	setShowSEM: (showSEM: string) => void;
	semAlpha: number;
}
export const useShowImage = (): UseShowImage => {
	const showImageType = useAtomValue(showImageTypeAtom);
	const showSEMType = useAtomValue(showSEMTypeAtom);
	const setShowImage = useAtomCallback(
		useCallback((_get, set, showImage: string) => {
			if (showImageTypeList.includes(showImage as showImageType)) {
				set(showImageTypeAtom, showImage as showImageType);
			} else {
				set(showImageTypeAtom, "none");
			}
		}, []),
	);
	const setShowSEM = useAtomCallback(
		useCallback((_get, set, showSEM: string) => {
			if (showSEMTypeList.includes(showSEM as showSEMType)) {
				set(showSEMTypeAtom, showSEM as showSEMType);
			} else {
				set(showSEMTypeAtom, "target");
			}
		}, []),
	);

	return {
		isHiddenSem: showImageType !== "sem",
		isHiddenPotential: showImageType !== "potential",
		isHiddenIntermediate: showImageType !== "intermediate",
		showImageType,
		setShowImage,
		showSEMType,
		setShowSEM,
		semAlpha: useAtomValue(semAlphaAtom),
	};
};

const showDefectAtom = selectAtom(imageViewPropsAtom, (p) => p.showDefect);
const defectAlphaAtom = selectAtom(imageViewPropsAtom, (p) => p.defectAlpha);
interface UseDefectOverlayViewProp {
	showDefect: boolean;
	defectAlpha: number;
}
export const useDefectOverlayViewProp = (): UseDefectOverlayViewProp => {
	return {
		showDefect: useAtomValue(showDefectAtom),
		defectAlpha: useAtomValue(defectAlphaAtom),
	};
};
const showBoxSegmentDataAtom = selectAtom(
	imageViewPropsAtom,
	(p) => p.showBoxSegmentData,
);
interface UseBoxSegmentViewProp {
	showBoxSegmentData: boolean;
}
export const useBoxSegmentViewProp = (): UseBoxSegmentViewProp => {
	return { showBoxSegmentData: useAtomValue(showBoxSegmentDataAtom) };
};
const showDesignDataAtom = selectAtom(
	imageViewPropsAtom,
	(p) => p.showDesignData,
);
interface UseDesignViewProp {
	showDesignData: boolean;
}
export const useDesignViewProp = (): UseDesignViewProp => {
	return { showDesignData: useAtomValue(showDesignDataAtom) };
};

const showRoiAtom = selectAtom(imageViewPropsAtom, (p) => p.showRoi);
interface UseRoiViewProp {
	showRoi: boolean;
}
export const useRoiViewProp = (): UseRoiViewProp => {
	return { showRoi: useAtomValue(showRoiAtom) };
};

export interface UseImageViewProp {
	imageViewProp: ImageViewProps;
	setMagnification: (magnification: number) => void;
	setViewWH: (viewW: number, viewH: number) => void;
	setCenterXY: (centerX: number, centerY: number) => void;
	setShowRoi: (showRoi: boolean) => void;
	setShowDefect: (showDefect: boolean) => void;
	setDefectAlpha: (defectAlpha: number) => void;
	setSemAlpha: (semAlpha: number) => void;
	setShowDesignData: (showDesignData: boolean) => void;
	setShowScale: (showSdcale: boolean) => void;
	setImageType: (imageType: string | null) => void;
	setShowBoxSegmentData: (showBoxSegmentData: boolean) => void;
	setShowCrossData: (showCrossData: boolean) => void;
}

export const useImageViewProp = (): UseImageViewProp => {
	const [imageViewProp, setImageViewProp] = useAtom(imageViewPropsAtom);
	const { enableDefect, enableDesign, enableBoxSegment } = useResultJobType();

	useEffect(() => {
		setImageViewProp((prev) => {
			return {
				...prev,
				showRoi: enableDefect,
				showDefect: enableDefect,
				showDesignData: enableDesign,
				showBoxSegmentData: enableBoxSegment,
			};
		});
	}, [enableBoxSegment, enableDefect, enableDesign, setImageViewProp]);

	const setMagnification = (magnification: number): void => {
		if (magnification === imageViewProp.magnification) return;
		setImageViewProp({ ...imageViewProp, magnification });
	};

	const setViewWH = (viewW: number, viewH: number): void => {
		if (viewW === imageViewProp.viewW && viewH === imageViewProp.viewH) return;
		setImageViewProp({ ...imageViewProp, viewW, viewH });
	};

	const setCenterXY = (centerX: number, centerY: number): void => {
		if (centerX === imageViewProp.centerX && centerY === imageViewProp.centerY)
			return;
		setImageViewProp({ ...imageViewProp, centerX, centerY });
	};

	const setShowRoi = (showRoi: boolean): void => {
		if (showRoi === imageViewProp.showRoi) return;
		setImageViewProp({ ...imageViewProp, showRoi });
	};

	const setShowDefect = (showDefect: boolean): void => {
		if (showDefect === imageViewProp.showDefect) return;
		setImageViewProp({ ...imageViewProp, showDefect });
	};

	const setDefectAlpha = (defectAlpha: number): void => {
		if (defectAlpha === imageViewProp.defectAlpha) return;
		setImageViewProp({ ...imageViewProp, defectAlpha });
	};

	const setSemAlpha = (semAlpha: number): void => {
		if (semAlpha === imageViewProp.semAlpha) return;
		setImageViewProp({ ...imageViewProp, semAlpha });
	};

	const setShowDesignData = (showDesignData: boolean): void => {
		if (showDesignData === imageViewProp.showDesignData) return;
		setImageViewProp({ ...imageViewProp, showDesignData });
	};

	const setShowScale = (showScale: boolean): void => {
		if (showScale === imageViewProp.showScale) return;
		setImageViewProp({ ...imageViewProp, showScale });
	};

	const setImageType = (imageType: string | null): void => {
		if (imageType === imageViewProp.imageType) return;

		switch (imageType) {
			case "target":
			case "reference1":
			case "reference2":
				setImageViewProp({ ...imageViewProp, imageType });
		}
	};

	const setShowBoxSegmentData = (showBoxSegmentData: boolean): void => {
		setImageViewProp((prev) =>
			showBoxSegmentData === prev.showBoxSegmentData
				? prev
				: { ...prev, showBoxSegmentData },
		);
	};

	const setShowCrossData = (showCrossData: boolean): void => {
		if (showCrossData === imageViewProp.showCrossData) return;
		setImageViewProp({ ...imageViewProp, showCrossData });
	};

	return {
		imageViewProp,
		setMagnification,
		setViewWH,
		setCenterXY,
		setShowRoi,
		setShowDefect,
		setDefectAlpha,
		setSemAlpha,
		setShowDesignData,
		setShowScale,
		setImageType,
		setShowBoxSegmentData,
		setShowCrossData,
	};
};

export const useSetImageViewDefectAndDesign = (): ((
	showDefect: boolean,
	showDesignData: boolean,
) => void) => {
	const setImageViewProps = useSetAtom(imageViewPropsAtom);

	return useCallback(
		(showDefect, showDesignData) =>
			setImageViewProps((prev) =>
				prev.showRoi === showDefect &&
				prev.showDefect === showDefect &&
				prev.showDesignData === showDesignData
					? prev
					: { ...prev, showRoi: showDefect, showDefect, showDesignData },
			),
		[setImageViewProps],
	);
};
