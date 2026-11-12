import { atom, useAtom } from "jotai";
import {
	type Dispatch,
	type SetStateAction,
	useCallback,
	useEffect,
	useState,
} from "react";

import type { Pagination } from "~/features/job-manager-info/types";
import { useModel } from "~/features/misc/hooks/useModel";

import { getSegmentationImageList } from "../api/getSegmentationImageList";
import type { SegmentationImage } from "../types";

const selectedSegmentationImageAtom = atom<SegmentationImage | undefined>(
	undefined,
);

interface UseSegmentationImageList {
	modelName: string;
	total: number;
	imageList: SegmentationImage[];
	pagination: Pagination;
	selectedFov: SegmentationImage | undefined;
	setPagination: Dispatch<SetStateAction<Pagination>>;
	setSelectedFovNo: (no: number) => void;
}

export const useSegmentationImageList = (): UseSegmentationImageList => {
	const [imageList, setImageListState] = useState<SegmentationImage[]>([]);
	const [selectedFov, setSelectedFov] = useAtom(selectedSegmentationImageAtom);
	const [total, setTotal] = useState(0);
	const [pagination, setPagination] = useState<Pagination>({
		pageSize: 100000,
		page: 0,
	});
	const { model: modelName } = useModel();

	const setImageList = useCallback(
		(newImageList: SegmentationImage[]): void => {
			setImageListState(newImageList);
			if (newImageList.length > 0) {
				// 未選択の場合は先頭Fovを選択状態にする
				setSelectedFov((prev) => prev ?? newImageList[0]);
			}
		},
		[setSelectedFov],
	);

	const setSelectedFovNo = (sfovno: number): void => {
		const newSelectedFov = imageList.find(
			(fov) => fov.trainingImageNo === sfovno,
		);
		if (newSelectedFov == null) return;
		setSelectedFov(newSelectedFov);
	};

	useEffect(() => {
		if (modelName.length === 0) return;

		const controller = new AbortController();
		getSegmentationImageList(modelName, controller.signal)
			.then((res) => {
				const setlist = res.map((path, index) => {
					const fileInfo = path.split(/_|\./);
					return {
						trainingImageNo: index + 1,
						resultNo: Number(fileInfo[0]),
						areaNo: Number(fileInfo[1]),
						mfovNo: Number(fileInfo[2]),
						sfovNo: Number(fileInfo[3]),
					};
				});

				setTotal(setlist.length);
				setImageList(setlist);
			})
			.catch((error) => {
				if (error.name === "AbortError") {
					return;
				}

				console.error("getSegmentationImageList fetch fail.", error);
			});
		return () => {
			controller.abort();
		};
	}, [modelName, setImageList]);

	return {
		modelName,
		imageList,
		total,
		pagination,
		selectedFov,
		setPagination,
		setSelectedFovNo,
	};
};
