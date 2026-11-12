import { useCallback, useRef, useState } from "react";
import { extractApiErrorInfo } from "~/lib/extractApiErrorMessage";
import { putCategoriesMapping } from "../api/putCategoriesMapping";
import type { PutCategoryMappingParam } from "../types";
import { useDataset } from "./useDataset";
import { useDatasetDefect } from "./useDatasetDefect";
import { useDatasetRun } from "./useDatasetRun";

export interface UseRemapCategories {
	isRunning: boolean;
	isRemapped: boolean | undefined;
	message: string | undefined;
	remap: (updates: PutCategoryMappingParam[]) => Promise<void>;
	reset: () => void;
}

export const useRemapCategories = () => {
	const { datasetName, datasetType } = useDataset();
	const [isRunning, setIsRunning] = useState(false);
	const [isRemapped, setIsRemapped] = useState<boolean | undefined>(undefined);
	const [message, setMessage] = useState<string | undefined>(undefined);
	const { setDatasetDefect } = useDatasetDefect();
	const { resetRun } = useDatasetRun();

	const controllerRef = useRef<AbortController | null>(null);

	const reset = useCallback(() => {
		setIsRunning(false);
		setIsRemapped(undefined);
		setMessage(undefined);
	}, []);

	const remap = useCallback(
		async (updates: PutCategoryMappingParam[]) => {
			setIsRunning(true);
			setIsRemapped(undefined);
			setMessage(undefined);

			controllerRef.current?.abort();
			const controller = new AbortController();
			controllerRef.current = controller;

			try {
				const total = await putCategoriesMapping(
					datasetType,
					datasetName,
					updates,
					controller.signal,
				);
				setIsRemapped(true);
				setMessage(`Remap completed. Updated ${total} rows.`);
				setDatasetDefect();
				resetRun();
			} catch (e) {
				const info = await extractApiErrorInfo(e);
				// AbortError 時は 無視する
				if (info.aborted) {
					return;
				}
				setIsRemapped(false);
				setMessage(info.message ?? "Apply failed.");
			} finally {
				setIsRunning(false);
				controllerRef.current = null;
			}
		},
		[datasetType, datasetName, setDatasetDefect, resetRun],
	);

	return {
		isRunning,
		isRemapped,
		message,
		remap,
		reset,
	};
};
