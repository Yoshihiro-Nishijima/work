import { useCallback, useEffect, useRef, useState } from "react";
import { extractApiErrorInfo } from "~/lib/extractApiErrorMessage";
import type { ApiErrorInfo } from "~/lib/extractApiErrorMessage";
import { createDataset } from "../api/createDataset";
import type { CreateDatasetStatus, Source } from "../types";
import { useCreateDatasetParam } from "./useCreateDatasetParam";
import { useDatasetProgress } from "./useDatasetProgress";

export interface UseCreateDataset {
	status: CreateDatasetStatus;
	isSubmitting: boolean;
	isCreating: boolean;
	isCancelling: boolean;
	isCancelled: boolean;
	isSuccess: boolean;
	isError: boolean;

	progress: number;
	createdDatasetId?: string;
	error?: { message: string };
	message?: string;

	submit(): Promise<void>;
	cancel(): Promise<void>;
	reset(): void;
}

export function useCreateDataset(): UseCreateDataset {
	const [status, setStatus] = useState<CreateDatasetStatus>("idle");
	const [createdDatasetId, setCreatedDatasetId] = useState<
		string | undefined
	>();
	const [message, setMessage] = useState<string | undefined>(undefined);

	const createAbortRef = useRef<AbortController | null>(null);

	const { datasetName, datasetType, sourceList } = useCreateDatasetParam();
	const {
		progress,
		startPolling,
		stopPolling,
		cancel: cancelOperation,
		reset: resetProgress,
	} = useDatasetProgress();

	// unmount cleanup
	useEffect(() => {
		return () => {
			resetProgress();
		};
	}, [resetProgress]);

	const onStatusChange = useCallback(
		(newStatus: CreateDatasetStatus, context?: { apiError?: ApiErrorInfo }) => {
			switch (newStatus) {
				case "success":
					setMessage("Dataset created successfully");
					break;
				case "error":
					setMessage(context?.apiError?.message || "Dataset creation failed");
					break;
				case "cancelled":
					setMessage("Dataset creation cancelled");
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

	// Dataset作成
	const submit = useCallback(async () => {
		// 許可状態以外は無視
		if (!["idle", "error", "cancelled", "success"].includes(status)) return;

		const prevStatus = status;
		setCreatedDatasetId(undefined);
		setMessage(undefined);
		stopPolling();

		setStatus("submitting");
		createAbortRef.current?.abort();
		createAbortRef.current = new AbortController();

		try {
			const newSources = sourceList.map((source: Source) => {
				if (source.sourceType === "Result") {
					return {
						source_type: source.sourceType,
						resultName: source.result.name,
						recipeName: source.result.recipe,
						executionDate: source.result.executionDate,
					};
				}
				return {
					source_type: source.sourceType,
					datasetName: source.dataset.datasetName,
					datasetType: source.dataset.datasetType,
				};
			});
			const { datasetId } = await createDataset(
				{ datasetName: datasetName, datasetType, sources: newSources },
				createAbortRef.current.signal,
			);
			setCreatedDatasetId(datasetId);
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
			setMessage(info.message ?? "Create failed.");
		}
	}, [
		startPolling,
		status,
		stopPolling,
		sourceList,
		datasetName,
		datasetType,
		onStatusChange,
	]);

	// Dataset作成キャンセル（creating時のみ）
	const cancel = useCallback(async () => {
		if (status !== "creating") return;
		if (!createdDatasetId) return;

		setStatus("cancelling");
		await cancelOperation(createdDatasetId);
	}, [status, createdDatasetId, cancelOperation]);

	// リセット
	const reset = useCallback(() => {
		resetProgress();
		setStatus("idle");
		setCreatedDatasetId(undefined);
		setMessage(undefined);
	}, [resetProgress]);

	// ---- 状態フラグ ----
	const isSubmitting = status === "submitting";
	const isCreating = status === "creating";
	const isCancelling = status === "cancelling";
	const isCancelled = status === "cancelled";
	const isSuccess = status === "success";
	const isError = status === "error";

	return {
		status,
		isSubmitting,
		isCreating,
		isCancelling,
		isCancelled,
		isSuccess,
		isError,
		progress,
		createdDatasetId,
		message,
		submit,
		cancel,
		reset,
	};
}
