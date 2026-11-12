import type { AlertColor } from "@mui/material";
import { atom, useAtom, useSetAtom } from "jotai";
import { useCallback, useEffect, useState } from "react";
import type {
	Dataset,
	DatasetSource,
	Result,
	ResultSource,
	Source,
} from "../types";
import { useCreateDatasetParam } from "./useCreateDatasetParam";

export const MAX_SOURCES = 10;

type SourceInput =
	| Source
	| (Omit<DatasetSource, "id"> & { id?: number })
	| (Omit<ResultSource, "id"> & { id?: number });
export type AddStatus = Extract<AlertColor, "success" | "warning" | "error">;

export interface UseSourceList {
	removeSource: () => void;
	removeAll: () => void;
	moveUp: () => void;
	moveDown: () => void;
	message?: string;
	// 同じ message/status 繰り返しでもUIトリガーに利用可能な単調増分カウンタ
	lastAddSeq: number;
	lastAddStatus?: AddStatus;
	selectedSource: Source | undefined;
	setSelectedSource: (s: Source | undefined) => void;
	addResultSource: (result: Result) => AddStatus;
	addDatasetSource: (dataset: Dataset) => AddStatus;
	replaceSources: (newSources: Source[]) => void;
	addable: boolean;
}

const selectedSourceAtom = atom<Source | undefined>(undefined);

const lastIdAtom = atom(0);

export const useSourceList = (): UseSourceList => {
	const { datasetType, sourceList, setSourceList } = useCreateDatasetParam();
	const [selectedSource, setSelectedSource] = useAtom(selectedSourceAtom);
	const [message, setMessage] = useState<string>();
	const [lastAddStatus, setLastAddStatus] = useState<AddStatus>();
	const [lastAddSeq, setLastAddSeq] = useState(0);
	const setLastId = useSetAtom(lastIdAtom);

	const addable = sourceList.length < MAX_SOURCES;

	const getNextId = useCallback((): number => {
		let nextValue = 0;
		setLastId((prev) => {
			nextValue = prev + 1;
			return nextValue;
		});
		return nextValue;
	}, [setLastId]);

	// 重複判定
	const isDuplicate = useCallback(
		(newSrc: Source): boolean =>
			sourceList.some((currentSrc) => {
				if (currentSrc.sourceType !== newSrc.sourceType) return false;
				if (
					currentSrc.sourceType === "Result" &&
					newSrc.sourceType === "Result"
				) {
					return (
						"result" in currentSrc &&
						"result" in newSrc &&
						currentSrc.result.recipe === newSrc.result.recipe &&
						currentSrc.result.executionDate === newSrc.result.executionDate &&
						currentSrc.result.jobType === newSrc.result.jobType
					);
				}
				if (
					currentSrc.sourceType === "Dataset" &&
					newSrc.sourceType === "Dataset"
				) {
					return (
						"dataset" in currentSrc &&
						"dataset" in newSrc &&
						currentSrc.dataset.datasetName === newSrc.dataset.datasetName &&
						currentSrc.dataset.createdDate === newSrc.dataset.createdDate &&
						currentSrc.dataset.datasetType === newSrc.dataset.datasetType
					);
				}
				return false;
			}),
		[sourceList],
	);

	const checkDatasetType = useCallback(
		(src: Source): boolean => {
			switch (datasetType) {
				case "ADC":
					if (src.sourceType === "Result") {
						return ["D2D", "C2C", "Trainable D2D", "Trainable D2DB"].includes(
							src.result.jobType,
						);
					}
					return src.dataset.datasetType === "ADC";
				case "Trainable D2D":
				case "Trainable D2DB":
					return true;
				default:
					return false;
			}
		},
		[datasetType],
	);

	const materializeSource = useCallback(
		(srcInput: SourceInput): Source => {
			if ("sourceType" in srcInput) {
				const newId = getNextId();
				return srcInput.sourceType === "Dataset"
					? ({
							...(srcInput as Omit<DatasetSource, "id">),
							id: newId,
						} as DatasetSource)
					: ({
							...(srcInput as Omit<ResultSource, "id">),
							id: newId,
						} as ResultSource);
			}
			return srcInput as Source;
		},
		[getNextId],
	);

	const validateSource = useCallback(
		(src: Source): { valid: boolean; message?: string } => {
			if (!checkDatasetType(src))
				return {
					valid: false,
					message: `The source is not compatible for ${datasetType} dataset creation.`,
				};
			return { valid: true };
		},
		[checkDatasetType, datasetType],
	);

	// datasetType変更時に不適合 Source を削除
	useEffect(() => {
		// sourceList の現在値から不適合を除外し、実際に変更がある場合のみ setter を呼ぶ
		const filtered = sourceList.filter(checkDatasetType);
		// 変更なし -> setter を呼ばない
		if (filtered.length === sourceList.length) return;
		// 選択中が消えたらリセット
		if (selectedSource && !filtered.some((s) => s.id === selectedSource.id)) {
			setSelectedSource(undefined);
		}
		setSourceList(filtered);
	}, [
		checkDatasetType,
		setSourceList,
		sourceList,
		selectedSource,
		setSelectedSource,
	]);

	const removeSource = useCallback(() => {
		if (!selectedSource) return;
		const targetId = selectedSource.id;
		const next = sourceList.filter((s) => s.id !== targetId);
		// 変更がなければ setter は呼ばない
		if (next.length === sourceList.length) {
			setSelectedSource(undefined);
			return;
		}
		setSourceList(next);
		setSelectedSource(undefined);
	}, [selectedSource, setSourceList, setSelectedSource, sourceList]);

	const removeAll = useCallback(() => {
		setSourceList([]);
		setSelectedSource(undefined);
		// 全削除時にIDカウンタをリセット
		setLastId(0);
		// lastAddSeq もリセット
		setLastAddSeq(0);
	}, [setSourceList, setSelectedSource, setLastId]);

	const moveUp = useCallback(() => {
		if (!selectedSource) return;
		const idx = sourceList.findIndex((s) => s.id === selectedSource.id);
		if (idx <= 0) return;
		const copy = [...sourceList];
		[copy[idx - 1], copy[idx]] = [copy[idx], copy[idx - 1]];
		setSourceList(copy);
	}, [selectedSource, setSourceList, sourceList]);

	const moveDown = useCallback(() => {
		if (!selectedSource) return;
		const idx = sourceList.findIndex((s) => s.id === selectedSource.id);
		if (idx < 0 || idx >= sourceList.length - 1) return;
		const copy = [...sourceList];
		[copy[idx + 1], copy[idx]] = [copy[idx], copy[idx + 1]];
		setSourceList(copy);
	}, [selectedSource, setSourceList, sourceList]);

	const insertSource = useCallback(
		(src: Source, position?: number) => {
			let next: Source[];
			if (position == null || position < 0 || position > sourceList.length) {
				next = [...sourceList, src];
			} else {
				next = [...sourceList];
				next.splice(position, 0, src);
			}
			setSourceList(next);
		},
		[setSourceList, sourceList],
	);

	const addSource = useCallback(
		(srcInput: SourceInput, position?: number): AddStatus => {
			if (!addable) {
				setMessage(
					`The source list is full. A maximum of ${MAX_SOURCES} data can be added.`,
				);
				setLastAddStatus("error");
				setLastAddSeq((s) => s + 1);
				return "error";
			}
			setMessage(undefined);
			setLastAddStatus(undefined);
			const materialized = materializeSource(srcInput);
			if (isDuplicate(materialized)) {
				setMessage("The source is already added in the source list.");
				setLastAddStatus("warning");
				setLastAddSeq((s) => s + 1);
				return "warning";
			}
			const { valid, message: invalidMsg } = validateSource(materialized);
			if (!valid) {
				setMessage(invalidMsg);
				setLastAddStatus("error");
				setLastAddSeq((s) => s + 1);
				return "error";
			}
			insertSource(materialized, position);
			setMessage("The source was added in the source list.");
			setLastAddStatus("success");
			setLastAddSeq((s) => s + 1);
			return "success";
		},
		[materializeSource, isDuplicate, validateSource, insertSource, addable],
	);

	const computeInsertionPosition = useCallback((): number | undefined => {
		// 未選択時は undefined (末尾)
		if (!selectedSource) return undefined;
		const idx = sourceList.findIndex((s) => s.id === selectedSource.id);
		if (idx === -1) return undefined;
		// 選択行の直後
		return idx + 1;
	}, [selectedSource, sourceList]);

	const addResultSource = useCallback(
		(result: Result): AddStatus =>
			addSource(
				{ result, sourceType: "Result" } as ResultSource,
				computeInsertionPosition(),
			),
		[addSource, computeInsertionPosition],
	);

	const addDatasetSource = useCallback(
		(dataset: Dataset): AddStatus =>
			addSource(
				{ dataset, sourceType: "Dataset" } as DatasetSource,
				computeInsertionPosition(),
			),
		[addSource, computeInsertionPosition],
	);

	const replaceSources = useCallback(
		(newSources: Source[]) => {
			setLastId(0);
			const reassigned: Source[] = [];
			for (const s of newSources) {
				reassigned.push({ ...s, id: getNextId() });
			}
			setSourceList(reassigned);
			setSelectedSource(undefined);
			setMessage(undefined);
			setLastAddStatus(undefined);
			setLastAddSeq(0);
		},
		[setLastId, getNextId, setSourceList, setSelectedSource],
	);

	return {
		removeSource,
		removeAll,
		moveUp,
		moveDown,
		message,
		lastAddStatus,
		selectedSource,
		setSelectedSource,
		addResultSource,
		addDatasetSource,
		lastAddSeq,
		replaceSources,
		addable,
	};
};
