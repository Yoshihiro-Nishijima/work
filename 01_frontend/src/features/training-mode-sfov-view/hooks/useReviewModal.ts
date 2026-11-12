import type {
	GridRowSelectionModel,
	GridSortModel,
} from "@mui/x-data-grid-pro";
import { atom, useAtom, useAtomValue, useSetAtom } from "jotai";
import { useEffect, useState } from "react";
import { useSFovViewModal } from "~/features/integrated-viewer-sfov-view/hooks/useSFovViewModal";
import { useMfovnoForSEMImage } from "~/features/map/hooks";
import { useSfovnoForSEMImage } from "~/features/map/hooks/useSfovnoForSEMImage";
import {
	selectedSFovImageIdSetReadAtom,
	selectedSFovListReadAtom,
	useSelectedSFovImageIdList,
} from "~/features/misc/hooks/useSelectedSFovImageIdList";
import type { Fov } from "~/features/s-fov-list/types";

const MAX_UNDO_COUNT = 10;

/* TrainingModeSFovViewMode表示状態管理 */
const reviewFovListAtom = atom<Fov[]>([]);
const isReviewModalOpenAtom = atom(false);
const selectedReviewFovAtom = atom<Fov | undefined>(undefined);
const removedHistoryAtom = atom<Fov[]>([]);
const isUndoDisabledAtom = atom(true);
const isRemoveDisabledAtom = atom(true);
const isPrevDisabledAtom = atom(true);
const isNextDisabledAtom = atom(true);

interface UseReviewModal {
	// ReviewModalの表示有無
	isReviewModalOpen: boolean;
	// ReviewModalを開く/閉じる
	setReviewModalOpen: (isOpen: boolean) => void;
	// ReviewModalの有効/無効
	isReviewModalDisabled: boolean;
}
const hasSelectedSFovSelector = atom((get) => {
	return get(selectedSFovImageIdSetReadAtom).size === 0;
});

export const useReviewModal = (): UseReviewModal => {
	const [isReviewModalOpen, setIsReviewModalOpen] = useAtom(
		isReviewModalOpenAtom,
	);
	const setSelectedReviewFov = useSetAtom(selectedReviewFovAtom);
	const { updateSFovViewModalOpen } = useSFovViewModal();
	const { setMfovnoForSEMImage } = useMfovnoForSEMImage();
	const { setSfovnoForSEMImage } = useSfovnoForSEMImage();

	const isReviewModalDisabled = useAtomValue(hasSelectedSFovSelector);

	const setReviewModalOpen = (isOpen: boolean): void => {
		if (!isOpen) {
			// リスト行選択状態、SEMImage表示をクリアする
			setSelectedReviewFov(undefined);
			setMfovnoForSEMImage(undefined);
			setSfovnoForSEMImage(undefined);
		}
		updateSFovViewModalOpen(isOpen);
		setIsReviewModalOpen(isOpen);
	};

	return {
		isReviewModalOpen,
		setReviewModalOpen,
		isReviewModalDisabled,
	};
};

// ReviewModal 初期ソート条件
const INIT_SORT_MODELS: GridSortModel = [{ field: "imageid", sort: "asc" }];
/**
 * Fovリストのソート
 * @param fovList Fovリスト
 * @param sortModels ソートモデル
 * @returns
 */
const sortFovList = (fovList: Fov[], sortModels: GridSortModel): Fov[] => {
	if (fovList.length === 0 || sortModels.length === 0) return fovList;
	const sortedFovList = [...fovList].sort((a: Fov, b: Fov) => {
		for (const { field, sort } of sortModels) {
			const aValue = a[field as keyof Fov];
			const bValue = b[field as keyof Fov];
			if (aValue == null && bValue != null) return sort === "asc" ? 1 : -1;
			if (aValue != null && bValue == null) return sort === "asc" ? -1 : 1;

			// 事前にチェック済みなので この null チェックは不要なのだが、指摘されるのでチェック
			if (aValue != null && bValue != null) {
				if (aValue < bValue) return sort === "asc" ? -1 : 1;
				if (aValue > bValue) return sort === "asc" ? 1 : -1;
			}
		}
		return 0;
	});
	return sortedFovList;
};

interface UseReviewSFov {
	reviewFovList: Fov[];
	rowSelectionModel: GridRowSelectionModel;
	removeFromSelection: () => void;
	undoSelection: () => void;
	setShowingSFov: (fov: Fov | undefined) => void;
	showPrevSFov: () => void;
	showNextSFov: () => void;
	clearHistory: () => void;
	isUndoDisabled: boolean;
	isRemoveDisabled: boolean;
	isPrevDisabled: boolean;
	isNextDisabled: boolean;
	setSortModel: (model: GridSortModel) => void;
}
export const useReviewSFov = (): UseReviewSFov => {
	const [selectedReviewFov, setSelectedReviewFov] = useAtom(
		selectedReviewFovAtom,
	);
	const [removedHistory, setRemovedHistory] = useAtom(removedHistoryAtom);
	const [reviewFovList, setReviewFovList] = useAtom(reviewFovListAtom);
	const [isUndoDisabled, setIsUndoDisabled] = useAtom(isUndoDisabledAtom);
	const [isRemoveDisabled, setIsRemoveDisabled] = useAtom(isRemoveDisabledAtom);
	const [isPrevDisabled, setIsPrevDisabled] = useAtom(isPrevDisabledAtom);
	const [isNextDisabled, setIsNextDisabled] = useAtom(isNextDisabledAtom);

	const fovList = useAtomValue(selectedSFovListReadAtom);
	const { add, remove } = useSelectedSFovImageIdList();
	const { setMfovnoForSEMImage } = useMfovnoForSEMImage();
	const { setSfovnoForSEMImage } = useSfovnoForSEMImage();
	const selectedSFovImageIdList = useAtomValue(selectedSFovImageIdSetReadAtom);

	const [sortModel, setSortModel] = useState(INIT_SORT_MODELS);

	const setShowingSFov = (fov: Fov | undefined): void => {
		if (fov == null) {
			setSelectedReviewFov(undefined);
			setMfovnoForSEMImage(undefined);
			setSfovnoForSEMImage(undefined);
		} else if (fov.imageid !== selectedReviewFov?.imageid) {
			setSelectedReviewFov(fov);
			setMfovnoForSEMImage(fov.mfovno);
			setSfovnoForSEMImage(fov.sfovno);
		}
	};

	const addToHistory = (fov: Fov): void => {
		removedHistory.push(fov);
		setRemovedHistory(removedHistory.slice(-MAX_UNDO_COUNT));
	};

	const removeFromSelection = (): void => {
		if (selectedReviewFov == null || reviewFovList.length <= 1) {
			return;
		}

		const beforeRowSelectionModelIndex = reviewFovList.findIndex(
			(fov: Fov) => fov.imageid === selectedReviewFov.imageid,
		);
		remove([selectedReviewFov.imageid]);
		addToHistory(selectedReviewFov);

		const newReviewFovList = reviewFovList.filter(
			(fov: Fov) => fov.imageid !== selectedReviewFov.imageid,
		);
		setReviewFovList(newReviewFovList);
		if (newReviewFovList.length === 0) {
			setShowingSFov(undefined);
			return;
		}
		beforeRowSelectionModelIndex >= newReviewFovList.length
			? setShowingSFov(newReviewFovList[newReviewFovList.length - 1])
			: setShowingSFov(newReviewFovList[beforeRowSelectionModelIndex]);
	};

	const undoSelection = (): void => {
		const fov = removedHistory.pop();
		setRemovedHistory(removedHistory);
		if (fov == null) return;
		add([fov]);
	};

	const showPrevSFov = (): void => {
		if (
			reviewFovList.length === 0 ||
			selectedReviewFov?.imageid === reviewFovList[0].imageid
		) {
			return;
		}
		const newSelection =
			reviewFovList[
				reviewFovList.findIndex(
					(e) => e.imageid === selectedReviewFov?.imageid,
				) - 1
			];
		setShowingSFov(newSelection);
	};

	const showNextSFov = (): void => {
		if (
			reviewFovList.length === 0 ||
			selectedReviewFov?.imageid ===
				reviewFovList[reviewFovList.length - 1].imageid
		) {
			return;
		}
		const newSelection =
			reviewFovList[
				reviewFovList.findIndex(
					(e) => e.imageid === selectedReviewFov?.imageid,
				) + 1
			];
		setShowingSFov(newSelection);
	};

	const clearHistory = (): void => {
		setRemovedHistory([]);
	};

	useEffect(() => {
		setIsUndoDisabled(removedHistory.length === 0);
	}, [removedHistory.length, setIsUndoDisabled]);

	useEffect(() => {
		setIsRemoveDisabled(selectedReviewFov == null || reviewFovList.length <= 1);
	}, [selectedReviewFov, setIsRemoveDisabled, reviewFovList.length]);

	useEffect(() => {
		setIsPrevDisabled(
			selectedReviewFov == null ||
				reviewFovList.length === 0 ||
				reviewFovList[0].imageid === selectedReviewFov?.imageid,
		);
	}, [selectedReviewFov, reviewFovList, setIsPrevDisabled]);

	useEffect(() => {
		setIsNextDisabled(
			selectedReviewFov == null ||
				reviewFovList.length === 0 ||
				reviewFovList[reviewFovList.length - 1].imageid ===
					selectedReviewFov?.imageid,
		);
	}, [selectedReviewFov, reviewFovList, setIsNextDisabled]);

	// 外部からのsFov選択状態反映
	// biome-ignore lint/correctness/useExhaustiveDependencies: 表の行の選択状態は外部からの選択状態と無関係のため監視しない
	useEffect(() => {
		const sortedFovList = sortFovList(fovList, sortModel);
		setReviewFovList(sortedFovList);
		if (selectedReviewFov == null) {
			setShowingSFov(sortedFovList[0]);
		}
	}, [fovList, setReviewFovList, selectedSFovImageIdList]);

	useEffect(() => {
		setReviewFovList((prev) => sortFovList(prev, sortModel));
	}, [setReviewFovList, sortModel]);

	const rowSelectionModel =
		selectedReviewFov != null ? [selectedReviewFov.imageid] : [];
	return {
		reviewFovList,
		rowSelectionModel,
		setShowingSFov,
		removeFromSelection,
		undoSelection,
		showPrevSFov,
		showNextSFov,
		clearHistory,
		isUndoDisabled,
		isRemoveDisabled,
		isPrevDisabled,
		isNextDisabled,
		setSortModel,
	};
};
