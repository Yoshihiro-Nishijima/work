import { atom, useAtom } from "jotai";
import { useCallback, useState } from "react";
import { copyDataset } from "~/features/ai-training/api/copyDataset";
import {
	type ApiErrorInfo,
	extractApiErrorInfo,
} from "~/lib/extractApiErrorMessage";
import type { CreateDatasetStatus, DatasetType } from "../types";
import { useDatasetProgress } from "./useDatasetProgress";

export interface UseCopyDataset {
	sourceDatasetName: string;
	setSourceDatasetName: (name: string) => void;
	sourceDatasetType?: DatasetType;
	setSourceDatasetType: (type: DatasetType | undefined) => void;
	destinationDatasetName: string;
	setDestinationDatasetName: (name: string) => void;

	status: CreateDatasetStatus;
	isSubmitting: boolean;
	isCreating: boolean;
	isCancelling: boolean;
	isCancelled: boolean;
	isSuccess: boolean;
	isError: boolean;
	progress: number;
	copiedDatasetId?: string;
	message?: string;
	copy: () => Promise<void>;
	cancel: () => Promise<void>;
	reset(): void;
}

const sourceDatasetNameAtom = atom("");
const destinationDatasetNameAtom = atom("");
const sourceDatasetTypeAtom = atom<DatasetType | undefined>(undefined);

export const useCopyDataset = (): UseCopyDataset => {
	const [sourceDatasetName, setSourceDatasetName] = useAtom(
		sourceDatasetNameAtom,
	);
	const [destinationDatasetName, setDestinationDatasetName] = useAtom(
		destinationDatasetNameAtom,
	);
	const [sourceDatasetType, setSourceDatasetType] = useAtom(
		sourceDatasetTypeAtom,
	);
	const [status, setStatus] = useState<CreateDatasetStatus>("idle");
	const [copiedDatasetId, setCopiedDatasetId] = useState<string | undefined>(
		undefined,
	);
	const [message, setMessage] = useState<string | undefined>(undefined);
	const {
		progress,
		startPolling,
		stopPolling,
		cancel: cancelOperation,
		reset: resetProgress,
	} = useDatasetProgress();

	const reset = () => {
		setSourceDatasetName("");
		setDestinationDatasetName("");
		setSourceDatasetType(undefined);
		setMessage(undefined);
		setCopiedDatasetId(undefined);
		resetProgress();
		setStatus("idle");
	};

	const onStatusChange = useCallback(
		(newStatus: CreateDatasetStatus, context?: { apiError?: ApiErrorInfo }) => {
			switch (newStatus) {
				case "success":
					setMessage("Dataset copied successfully");
					break;
				case "error":
					setMessage(context?.apiError?.message || "Dataset copy failed");
					break;
				case "cancelled":
					setMessage("Dataset copy cancelled");
					break;
				case "creating":
					// cancel 失敗などの一時的通知
					if (context?.apiError?.message) setMessage(context.apiError.message);
					break;
				default:
				// idle / submitting などはメッセージ変更なし
			}
			setStatus(newStatus);
		},
		[],
	);

	const copy = async () => {
		// 許可状態以外は無視
		if (!["idle", "error", "cancelled", "success"].includes(status)) return;

		const prevStatus = status;
		setCopiedDatasetId(undefined);
		setMessage(undefined);
		stopPolling();

		setStatus("submitting");

		try {
			const { datasetId } = await copyDataset(
				sourceDatasetType || "",
				sourceDatasetName,
				destinationDatasetName,
			);
			setCopiedDatasetId(datasetId);
			setStatus("creating");
			startPolling(datasetId, undefined, onStatusChange);
		} catch (e) {
			const info = await extractApiErrorInfo(e);
			// AbortError 時は statusを戻す
			if (info.aborted) {
				setStatus(prevStatus);
				return;
			}
			setStatus("error");
			setMessage(info.message ?? "Copy failed.");
		}
	};

	const cancel = async () => {
		if (status !== "creating") return;
		if (!copiedDatasetId) return;

		setStatus("cancelling");
		await cancelOperation(copiedDatasetId);
	};

	// ---- 状態フラグ ----
	const isSubmitting = status === "submitting";
	const isCreating = status === "creating";
	const isCancelling = status === "cancelling";
	const isCancelled = status === "cancelled";
	const isSuccess = status === "success";
	const isError = status === "error";

	return {
		sourceDatasetName,
		setSourceDatasetName,
		sourceDatasetType,
		setSourceDatasetType,
		destinationDatasetName,
		setDestinationDatasetName,

		status,
		isSubmitting,
		isCreating,
		isCancelling,
		isCancelled,
		isSuccess,
		isError,
		progress,
		copiedDatasetId,
		message,
		copy,
		cancel,
		reset,
	};
};
