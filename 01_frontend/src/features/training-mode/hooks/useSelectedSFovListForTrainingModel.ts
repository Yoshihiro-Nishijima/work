import { useEffect, useState } from "react";

import { useSelectedModel } from "~/features/training-param-setting/hooks/useSelectedModel";
import type { GetTrainingDetailParam } from "~/features/training-param-setting/types";

import { getSelectedFovListForTrainingModel } from "../api/getSelectedSFovListForTrainingModel";

export interface UseSelectedSFovListForTrainingModel {
	selectedSFovListForTrainingModel: number[];
}

export const useSelectedSFovListForTrainingModel =
	(): UseSelectedSFovListForTrainingModel => {
		const { selectedModel } = useSelectedModel();
		const [
			selectedSFovListForTrainingModel,
			setSelectedSFovListForTrainingModel,
		] = useState<number[]>([]);

		useEffect(() => {
			if (selectedModel == null) return;
			// 選択中sfov取得API実行
			const controller = new AbortController();
			const param: GetTrainingDetailParam = {
				type: selectedModel.type,
				modelName: selectedModel.modelName,
			};
			getSelectedFovListForTrainingModel(param, controller.signal)
				.then((res) => {
					setSelectedSFovListForTrainingModel(res);
				})
				.catch((error) => {
					if (error.name === "AbortError") return;
					console.error("getSelectedFovListForTrainingModel fail", error);
				});
			return () => {
				controller.abort();
			};
		}, [selectedModel]);
		return {
			selectedSFovListForTrainingModel,
		};
	};
