import { useEffect, useMemo, useState } from "react";
import { useDefect } from "~/features/info-and-defect/hooks/useDefect";
import type { Size } from "~/features/misc/types";
import { setDefectColor } from "./useOverlayImage";

interface UseDefectImage {
	defectImgURL?: string;
	size: Size;
}

export const useDefectImage = (defectImageURL: string): UseDefectImage => {
	const { filteredDefects } = useDefect();
	const [overlayImageData, setOverlayImageData] = useState<ImageData>();

	useEffect(() => {
		if (defectImageURL === "") {
			setOverlayImageData(undefined);
			return;
		}

		const img = new Image();

		img.src = defectImageURL;
		img.onload = () => {
			const canvas = document.createElement("canvas");
			const context = canvas.getContext("2d");
			if (!context) return;

			const { width, height } = img;
			canvas.width = width;
			canvas.height = height;

			context.drawImage(img, 0, 0);
			setOverlayImageData(context.getImageData(0, 0, width, height));
		};

		return () => {
			img.onload = null;
		};
	}, [defectImageURL]);

	return useMemo(() => {
		if (!(overlayImageData && filteredDefects.length)) {
			return { size: { width: 0, height: 0 } };
		}

		const canvas = document.createElement("canvas");
		const context = canvas.getContext("2d");
		if (!context) return { size: { width: 0, height: 0 } };

		const { data: overlayData, width, height } = overlayImageData;
		canvas.width = width;
		canvas.height = height;

		const imageData = context.createImageData(width, height);
		const { data } = imageData;
		const defectNos = new Set(filteredDefects.map(({ defectNo }) => defectNo));

		for (let r = 0, len = overlayData.length; r < len; r += 4) {
			// defectNo(8bit)がdefectNoListに含まれていたら色付け
			if (overlayData[r] > 0 && defectNos.has(overlayData[r])) {
				setDefectColor(data, r);
			}
		}

		context.putImageData(imageData, 0, 0);
		return { defectImgURL: canvas.toDataURL(), size: { width, height } };
	}, [overlayImageData, filteredDefects]);
};
