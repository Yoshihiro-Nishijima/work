import { useCallback, useState } from "react";
import { deleteDataset } from "~/features/ai-training/api/deleteDataset";
import { extractApiErrorInfo } from "~/lib/extractApiErrorMessage";

export interface UseDeleteDataset {
	isDeleted?: boolean;
	deleteByName: (datasetType: string, name: string) => () => void;
	resetDeleted: () => void;
}

export function useDeleteDataset(): UseDeleteDataset {
	const [isDeleted, setIsDeleted] = useState<boolean | undefined>(undefined);
	const resetDeleted = useCallback(() => setIsDeleted(undefined), []);

	const deleteByName = (datasetType: string, name: string): (() => void) => {
		const controller = new AbortController();

		deleteDataset(datasetType, name, controller.signal)
			.then((_res) => {
				setIsDeleted(true);
			})
			.catch(async (e) => {
				const info = await extractApiErrorInfo(e);
				// AbortError 時は無視
				if (info.aborted) return;
				console.error(info.message ?? "Delete failed.");
				setIsDeleted(false);
			});
		return () => {
			controller.abort();
		};
	};

	return {
		isDeleted,
		deleteByName,
		resetDeleted,
	};
}
