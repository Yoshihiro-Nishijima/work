import { useState } from "react";
import { extractApiErrorInfo } from "~/lib/extractApiErrorMessage";
import { saveModelName } from "../api/saveModelName";
import { useDataset } from "./useDataset";

interface UseSaveModelName {
	isLoading: boolean;
	doSaveModelName: (
		modelName: string,
		onSuccess: (msg: string) => void,
		onError: (msg: string) => void,
	) => Promise<void>;
}

export const useModelName = (): UseSaveModelName => {
	const [isLoading, setIsLoading] = useState(false);
	const { datasetName } = useDataset();
	const doSaveModelName = async (
		modelName: string,
		onSuccess: (msg: string) => void,
		onError: (msg: string) => void,
	) => {
		setIsLoading(true);
		try {
			const controller = new AbortController();
			await saveModelName(datasetName ?? "", modelName, controller.signal);
			onSuccess(`Succeeded in saving ${modelName}.`);
		} catch (error) {
			const info = await extractApiErrorInfo(error);
			// AbortError 時は 無視する
			if (info.aborted) return;
			onError(info.message ?? "saveModelName fail");
		} finally {
			setIsLoading(false);
		}
	};
	return { isLoading, doSaveModelName };
};
