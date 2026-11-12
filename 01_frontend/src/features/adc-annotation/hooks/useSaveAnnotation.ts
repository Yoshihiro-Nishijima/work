import { useCallback, useState } from "react";
import { putCategoriesById } from "~/features/adc-annotation/api/putCategoriesById";
import { extractApiErrorInfo } from "~/lib/extractApiErrorMessage";
import type { PutCategoriesByIdParam } from "../types";
import { useDataset } from "./useDataset";
import { useDatasetDefect } from "./useDatasetDefect";

export interface UseSaveAnnotation {
	isSaving: boolean;
	isAnnotationSaved?: boolean;
	message?: string;
	saveAnnotation: (dataparam: PutCategoriesByIdParam[]) => () => void;
}

export const useSaveAnnotation = (): UseSaveAnnotation => {
	const { datasetName, datasetType } = useDataset();
	const [isAnnotationSaved, setIsAnnotationSaved] = useState<
		boolean | undefined
	>(undefined);
	const [isSaving, setIsSaving] = useState(false);
	const [message, setMessage] = useState<string | undefined>(undefined);
	const { setDatasetDefect } = useDatasetDefect();

	const saveAnnotation = useCallback(
		(param: PutCategoriesByIdParam[]): (() => void) => {
			const controller = new AbortController();

			setMessage(undefined);
			setIsAnnotationSaved(undefined);
			setIsSaving(true);

			putCategoriesById(datasetType, datasetName, param, controller.signal)
				.then((total) => {
					if (controller.signal.aborted) return;
					setMessage(`Annotation saved successfully. Updated ${total} rows.`);
					setIsAnnotationSaved(true);
					setIsSaving(false);
					setDatasetDefect();
				})
				.catch(async (e) => {
					const info = await extractApiErrorInfo(e);
					// AbortError 時は 無視する
					if (info.aborted) {
						setIsSaving(false);
						return;
					}
					setIsAnnotationSaved(false);
					setMessage(info.message ?? "Save failed.");
					setIsSaving(false);
				});

			return () => controller.abort();
		},
		[datasetType, datasetName, setDatasetDefect],
	);

	return { isSaving, isAnnotationSaved, message, saveAnnotation };
};
