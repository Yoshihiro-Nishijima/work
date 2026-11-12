import { useEffect, useState } from "react";

import { useResultName } from "~/features/misc/hooks/useResultName";

import { getImageInfo } from "../api/getImageInfo";
import type { ImageInfo } from "../types";

interface UseImageInfo {
	total: number;
	imageInfoList: ImageInfo[];
}

export const useImageInfo = (): UseImageInfo => {
	const [imageInfoList, setImageInfoList] = useState<ImageInfo[]>([]);
	const [total, setTotal] = useState(0);
	const { resultName } = useResultName();
	useEffect(() => {
		if (resultName.length === 0) return;
		const controller = new AbortController();
		getImageInfo(resultName, controller.signal)
			.then((res) => {
				setTotal(res.total);
				setImageInfoList(res.imageInfo);
			})
			.catch((error) => {
				if (error.name === "AbortError") return;
				console.error("getImageInfo fetch fail.", error);
			});
		return () => {
			controller.abort();
		};
	}, [resultName]);
	return {
		imageInfoList,
		total,
	};
};
