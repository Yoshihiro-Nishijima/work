import { atom, useAtom } from "jotai";

import {
	type SegmentationImageViewProps,
	defaultImageView,
} from "~/features/segmentation-image/types";

const segmentationImageViewPropsAtom = atom(defaultImageView);

export interface UseSegmentationImageViewProp {
	imageViewProp: SegmentationImageViewProps;
	setShowSegmentation: (show: boolean) => void;
	setSegmentationAlpha: (defectAlpha: number) => void;
	setMagnification: (magnification: number) => void;
	setViewWH: (viewW: number, viewH: number) => void;
	setCenterXY: (centerX: number, centerY: number) => void;
	setShowScale: (showSdcale: boolean) => void;
}

export const useSegmentationImageViewProp =
	(): UseSegmentationImageViewProp => {
		const [imageViewProp, setImageViewProp] = useAtom(
			segmentationImageViewPropsAtom,
		);

		const setShowSegmentation = (show: boolean): void => {
			if (show === imageViewProp.showSegmentation) return;
			setImageViewProp({ ...imageViewProp, showSegmentation: show });
		};

		const setSegmentationAlpha = (alpha: number): void => {
			if (alpha === imageViewProp.segmentationAlpha) return;
			setImageViewProp({ ...imageViewProp, segmentationAlpha: alpha });
		};

		const setMagnification = (magnification: number): void => {
			if (magnification === imageViewProp.magnification) return;
			setImageViewProp({ ...imageViewProp, magnification });
		};

		const setViewWH = (viewW: number, viewH: number): void => {
			if (viewW === imageViewProp.viewW && viewH === imageViewProp.viewH)
				return;
			setImageViewProp({ ...imageViewProp, viewW, viewH });
		};

		const setCenterXY = (centerX: number, centerY: number): void => {
			if (
				centerX === imageViewProp.centerX &&
				centerY === imageViewProp.centerY
			)
				return;
			setImageViewProp({ ...imageViewProp, centerX, centerY });
		};

		const setShowScale = (showScale: boolean): void => {
			if (showScale === imageViewProp.showScale) return;
			setImageViewProp({ ...imageViewProp, showScale });
		};
		return {
			imageViewProp,
			setShowSegmentation,
			setSegmentationAlpha,
			setMagnification,
			setViewWH,
			setCenterXY,
			setShowScale,
		};
	};
