import type { GridColumnVisibilityModel } from "@mui/x-data-grid-pro";
import { atom, useAtom, useAtomValue, useSetAtom } from "jotai";
import { Point } from "pixi.js";
import {
	type Dispatch,
	type SetStateAction,
	useCallback,
	useMemo,
} from "react";

import { useSFovListOfDisplayedMFovAtAllTime } from "~/features/integrated-viewer-map/hooks/useMapSFovs";
import type { Pagination, Sort } from "~/features/job-manager-info/types";
import {
	useMfovnoForSEMImage,
	useSfovnoForSEMImage,
} from "~/features/map/hooks";
import { useMapClickedStatus } from "~/features/misc/hooks/useMapClickedStatus";
import { useMapSelectionStatus } from "~/features/misc/hooks/useMapSelectionStatus";
import { useResultName } from "~/features/misc/hooks/useResultName";
import { useSelectedDefect } from "~/features/misc/hooks/useSelectedDefect";
import { selectedSFovImageIdSetReadAtom } from "~/features/misc/hooks/useSelectedSFovImageIdList";
import {
	toPagingQueryParam,
	toSQLFilter,
} from "~/features/misc/types/pagingQueryParam";

import { atomWithReset } from "jotai/utils";
import { getFov } from "../api/getFov";
import type { Fov } from "../types";
import { useFovFilter } from "./useFovFilter";

export const selectedFovAtom = atomWithReset<Fov | undefined>(undefined);
export const fovListAtom = atom<Fov[]>([]);
const totalAtom = atom(0);
const paginationAtom = atom<Pagination>({ pageSize: 10000, page: 0 });
const sortAtom = atom<Sort[]>([]);
const columnVisibilityModelAtom = atom<GridColumnVisibilityModel | undefined>(
	undefined,
);

interface UseFovList {
	total: number;
	fovList: Fov[];
	pagination: Pagination;
	selectedFov: Fov | undefined;
	selectedFovListForTraining: Fov[];
	getFovByFovNo: (mFovNo: number, sFovNo: number) => Fov | undefined;
}

export const useFovList = (): UseFovList => {
	const fovList = useAtomValue(fovListAtom);
	const total = useAtomValue(totalAtom);
	const selectedFov = useAtomValue(selectedFovAtom);
	const pagination = useAtomValue(paginationAtom);
	const selectedImageIdSet = useAtomValue(selectedSFovImageIdSetReadAtom);
	const selectedFovListForTraining = useMemo(
		() => fovList.filter((fov) => selectedImageIdSet.has(fov.imageid)),
		[fovList, selectedImageIdSet],
	);

	const getFovByFovNo = useCallback(
		(mFovNo: number, sFovNo: number): Fov | undefined => {
			return fovList.find((f) => f.mfovno === mFovNo && f.sfovno === sFovNo);
		},
		[fovList],
	);

	return {
		fovList,
		total,
		pagination,
		selectedFov,
		selectedFovListForTraining,
		getFovByFovNo,
	};
};

interface UseDefaultSelectedSFov {
	/** sFOV選択中か否か */
	hasSelectedSFov: boolean;
	/** sFOV選択初期化処理(選択中の場合は何もしない) */
	initSelectedSFov: (defaultSFov: Fov | undefined) => void;
}
// sFOV選択初期化用フック
export const useDefaultSelectedSFov = (): UseDefaultSelectedSFov => {
	const fovList = useAtomValue(fovListAtom);
	const [selectedFov, setSelectedFov] = useAtom(selectedFovAtom);
	const { selectedDefect } = useSelectedDefect();
	const { setMfovnoForSEMImage } = useMfovnoForSEMImage();
	const { setSfovnoForSEMImage } = useSfovnoForSEMImage();
	const { setSelectedChipIndex } = useMapSelectionStatus();

	const hasSelectedSFov =
		fovList.length === 0 || selectedDefect != null || selectedFov != null;
	const initSelectedSFov = (defaultSFov: Fov | undefined) => {
		if (hasSelectedSFov) return;
		if (defaultSFov != null && selectedFov == null) {
			// Fov未選択の場合は初回のみDefault選択Fovを選択状態にする。
			// 見つからない場合はリストの先頭を選択状態にする。
			// (初回以外はMap画面やsFOVリスト上でのsFOV選択に従う。)
			const firstFov =
				fovList.find(
					(fov) =>
						fov.mfovno === defaultSFov.mfovno &&
						fov.sfovno === defaultSFov.sfovno &&
						fov.indexX === defaultSFov.indexX &&
						fov.indexY === defaultSFov.indexY,
				) ?? fovList[0];
			setSelectedFov(firstFov);
			setMfovnoForSEMImage(firstFov.mfovno);
			setSfovnoForSEMImage(firstFov.sfovno);
			// Map部全体およびMap部WaferMapレベルで使用する選択Chipをセット
			setSelectedChipIndex(new Point(firstFov.indexX, firstFov.indexY));
		} else if (defaultSFov == null && selectedFov == null) {
			// Fov未選択で、Default選択Fovが未指定の場合は先頭Fovを選択状態にする。
			setSelectedFov(fovList[0]);
			setMfovnoForSEMImage(fovList[0].mfovno);
			setSfovnoForSEMImage(fovList[0].sfovno);
			setSelectedChipIndex(new Point(fovList[0].indexX, fovList[0].indexY));
		}
	};
	return { hasSelectedSFov, initSelectedSFov };
};

interface UseSetFovList {
	setPagination: Dispatch<SetStateAction<Pagination>>;
	sort: Sort[];
	setSort: Dispatch<SetStateAction<Sort[]>>;
	columnVisibilityModel: GridColumnVisibilityModel | undefined;
	setColumnVisibilityModel: Dispatch<
		SetStateAction<GridColumnVisibilityModel | undefined>
	>;
	setSelectedFovImageId: (index: number) => void;
	setSelectedFovImageIdForTraining: (index: number) => void;
	setFetchedFovList: () => void;
	setFovList: (newFovList: Fov[]) => void;
}

export const useSetSFovList = (): UseSetFovList => {
	const [fovList, setFovList] = useAtom(fovListAtom);
	const setSelectedFov = useSetAtom(selectedFovAtom);
	const setTotal = useSetAtom(totalAtom);
	const [pagination, setPagination] = useAtom(paginationAtom);
	const [sort, setSort] = useAtom(sortAtom);
	const [columnVisibilityModel, setColumnVisibilityModel] = useAtom(
		columnVisibilityModelAtom,
	);
	const { setMfovnoForSEMImage } = useMfovnoForSEMImage();
	const { setSfovnoForSEMImage } = useSfovnoForSEMImage();

	const { resultName } = useResultName();
	const { filter, filterColumns } = useFovFilter();
	const { setSelectedChipIndex } = useMapSelectionStatus();
	const { setClickedPoint } = useMapClickedStatus();
	const { sFovListOfDisplayedMFovAtAllTime } =
		useSFovListOfDisplayedMFovAtAllTime();

	// sFov選択時の設定処理(統合Viewer/ProgressMonitor)
	const setSelectedFovImageId = useCallback(
		(imageId: number): void => {
			const newSelectedFov =
				fovList.find((fov) => fov.imageid === imageId) ??
				sFovListOfDisplayedMFovAtAllTime.find((fov) => fov.imageid === imageId);
			if (newSelectedFov == null) return;
			setSelectedFov(newSelectedFov);
			setMfovnoForSEMImage(newSelectedFov.mfovno);
			setSfovnoForSEMImage(newSelectedFov.sfovno);
			// Map部全体およびMap部WaferMapレベルで使用する選択Chipをセット
			setClickedPoint(undefined);
			// mFOVMapレベルで使用する選択Chipをセット
			setSelectedChipIndex(
				new Point(newSelectedFov.indexX, newSelectedFov.indexY),
			);
		},
		[
			fovList,
			sFovListOfDisplayedMFovAtAllTime,
			setClickedPoint,
			setMfovnoForSEMImage,
			setSelectedChipIndex,
			setSelectedFov,
			setSfovnoForSEMImage,
		],
	);

	// sFov選択時の設定処理(TrainingMode)
	const setSelectedFovImageIdForTraining = useCallback(
		(imageId: number): void => {
			const newSelectedFov =
				fovList.find((fov) => fov.imageid === imageId) ??
				sFovListOfDisplayedMFovAtAllTime.find((fov) => fov.imageid === imageId);
			if (newSelectedFov == null) return;
			// TrainingModeではsFOV複数選択のため、sFOV選択処理は別管理
			setMfovnoForSEMImage(newSelectedFov.mfovno);
			setSfovnoForSEMImage(newSelectedFov.sfovno);
			// Map部全体およびMap部WaferMapレベルで使用する選択Chipをセット
			setClickedPoint(undefined);
			// mFOVMapレベルで使用する選択Chipをセット
			setSelectedChipIndex(
				new Point(newSelectedFov.indexX, newSelectedFov.indexY),
			);
		},
		[
			fovList,
			sFovListOfDisplayedMFovAtAllTime,
			setClickedPoint,
			setMfovnoForSEMImage,
			setSelectedChipIndex,
			setSfovnoForSEMImage,
		],
	);

	const setFetchedFovList = useCallback(() => {
		if (resultName.length === 0) return;
		const controller = new AbortController();
		const query = toPagingQueryParam(
			pagination,
			sort,
			toSQLFilter(filter, filterColumns),
		);
		getFov(resultName, query, controller.signal)
			.then((res) => {
				res.total != null && setTotal(res.total);
				res.fovs != null && setFovList(res.fovs);
			})
			.catch((error) => {
				if (error.name === "AbortError") return;
				console.error("getFov fetch fail.", error);
			});
		return () => {
			controller.abort();
		};
	}, [
		resultName,
		pagination,
		sort,
		filter,
		filterColumns,
		setTotal,
		setFovList,
	]);

	return {
		setPagination,
		sort,
		setSort,
		columnVisibilityModel,
		setColumnVisibilityModel,
		setSelectedFovImageId,
		setSelectedFovImageIdForTraining,
		setFetchedFovList,
		setFovList,
	};
};
