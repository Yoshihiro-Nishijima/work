import { useEffect, useState } from "react";

import { getSegmentationInfo } from "../api/getSegmentationInfo";
import type { SegmentationInfo } from "../types";

export const useSegmentation = (model: string): SegmentationInfo => {
	const [segmentation, setSegmentation] = useState<SegmentationInfo>({
		exec: false,
		numberOfSegments: 0,
		sensitivity: [],
	});

	useEffect(() => {
		if (model === "") {
			setSegmentation({ exec: false, numberOfSegments: 0, sensitivity: [] });
			return;
		}

		const controller = new AbortController();
		getSegmentationInfo(model, controller.signal)
			.then((res) => {
				setSegmentation(res);
			})
			.catch((error) => {
				if (error.name === "AbortError") return;
				console.error("getModels fetch fail.", error);
			});
		return () => {
			controller.abort();
		};
	}, [model]);

	return segmentation;
};
