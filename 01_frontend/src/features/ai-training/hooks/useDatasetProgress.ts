import { useCallback, useState } from "react";
import { extractApiErrorInfo } from "~/lib/extractApiErrorMessage";
import type { ApiErrorInfo } from "~/lib/extractApiErrorMessage";
import { usePolling } from "~/lib/usePolling";
import { toLocalDateStr } from "~/utils/formatter";
import { clamp } from "~/utils/numUtils";
import { cancelDatasetCreation } from "../api/cancelDatasetCreation";
import {
	type DatasetErrorCode,
	type DatasetProgressMetadata,
	getDatasetProgress,
} from "../api/getDatasetProgress";
import type { CreateDatasetStatus } from "../types";

const getErrorMessage = (
	errorCode?: DatasetErrorCode,
	source_type?: string,
	metadata?: DatasetProgressMetadata,
): string => {
	const getSourceName = (): string => {
		if (source_type === "Dataset") {
			return metadata?.dataset_name || "";
		}
		if (source_type === "Result") {
			if (metadata?.recipe_name && metadata?.execution_date) {
				const execution_date = toLocalDateStr(metadata?.execution_date);
				return `${execution_date}_${metadata.recipe_name}`;
			}
			return "";
		}
		return "";
	};

	const sourceName = getSourceName();

	switch (errorCode) {
		case "SOURCE_NOT_FOUND":
			return `"${sourceName}" is not found, it might be deleted after selection. Please confirm the existence of "${sourceName}".`;
		case "SOURCE_IN_DELETION_QUEUE":
			return `"${sourceName}" will be deleted. Please remove "${sourceName}" from the deletion queue.`;
		case "SOURCE_DELETED_DURING_CREATION":
			return `"${metadata?.file_name || "Unknown file"}" is not found in "${sourceName}". "${sourceName}" might be deleted during dataset creation. Please confirm the existence of "${sourceName}".`;
		case "SCHEMA_INCOMPATIBLE":
			return (
				metadata?.message ??
				"Merge aborted due to schema incompatibility between datasets."
			);
		case "OTHER":
			return "";
		default:
			return "";
	}
};

export interface UseDatasetProgress {
	progress: number;
	startPolling: (
		id: string,
		intervalMs?: number,
		onStatusChange?: (
			status: CreateDatasetStatus,
			context?: { apiError?: ApiErrorInfo },
		) => void,
	) => void;
	stopPolling: () => void;
	cancel: (id: string) => Promise<void>;
	reset: () => void;
}

export function useDatasetProgress(): UseDatasetProgress {
	const [progress, setProgress] = useState(0);
	// 他関数（cancel など）からも参照できるように onStatusChange を保持
	const [statusCallback, setStatusCallback] =
		useState<
			(
				status: CreateDatasetStatus,
				context?: { apiError?: ApiErrorInfo },
			) => void
		>();

	const { start, stop } = usePolling();
	const stopPolling = useCallback(() => {
		stop();
		setStatusCallback(undefined);
	}, [stop]);

	const startPolling = useCallback(
		(
			id: string,
			intervalMs = 10000,
			onStatusChange?: (
				status: CreateDatasetStatus,
				context?: { apiError?: ApiErrorInfo },
			) => void,
		) => {
			stopPolling();
			// 渡されたコールバックを state に保存
			setStatusCallback(() => onStatusChange);
			start(async (signal) => {
				try {
					const res = await getDatasetProgress(id, signal);
					setProgress(clamp(res.progress, 0, 100));

					if (res.status === "FAILED") {
						const message = getErrorMessage(
							res.error_code,
							res.source_type,
							res.metadata,
						);
						(onStatusChange ?? statusCallback)?.("error", {
							apiError: { aborted: false, message },
						});
						stopPolling();
						return;
					}
					if (res.status === "CANCELED") {
						(onStatusChange ?? statusCallback)?.("cancelled");
						stopPolling();
						return;
					}
					const reached = res.progress >= 100 || res.status === "COMPLETED";
					if (reached) {
						setProgress(100);
						(onStatusChange ?? statusCallback)?.("success");
						stopPolling();
						return;
					}
				} catch (e) {
					const info = await extractApiErrorInfo(e);
					if (info.aborted) return;
					(onStatusChange ?? statusCallback)?.("error", { apiError: info });
					stopPolling();
					return;
				}
			}, intervalMs);
		},
		[stopPolling, statusCallback, start],
	);

	const cancel = useCallback(
		async (id: string) => {
			try {
				await cancelDatasetCreation(id);
				// canceledへの遷移は進捗ポーリングに任せる
			} catch (e) {
				const info = await extractApiErrorInfo(e);
				// create は継続しているので creating のまま、エラー情報だけ通知
				statusCallback?.("creating", { apiError: info });
				return;
			}
		},
		[statusCallback],
	);

	const reset = useCallback(() => {
		stopPolling();
		setProgress(0);
	}, [stopPolling]);

	return {
		progress,
		startPolling,
		stopPolling,
		cancel,
		reset,
	};
}
