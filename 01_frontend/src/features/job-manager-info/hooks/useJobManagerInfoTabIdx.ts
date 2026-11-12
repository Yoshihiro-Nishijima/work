import {
	type Dispatch,
	type SetStateAction,
	useEffect,
	useRef,
	useState,
} from "react";

import { useInitRecipeCommonParam } from "~/features/recipe/hooks/useRecipeCommonParam";
import { useTrainingParamVisible } from "~/features/training-param-setting/hooks/useTrainingParamVisible";

import { useRecipeVisible } from "../../misc/hooks/useRecipeVisible";
import { useSelectedJobInfo } from "./useSelectedJobInfo";

export const useJobManagerInfoTabIdx = (
	initTabIdx: number,
	recipeVisibleIdx: number,
	trainingDataVisibleIdx: number,
): { setTabIdx: Dispatch<SetStateAction<number>> } => {
	const { selectedResultsJobName } = useSelectedJobInfo();
	const setRecipeCommonParam = useInitRecipeCommonParam();

	const { setRecipeVisible } = useRecipeVisible();
	const { setTrainingParamVisible } = useTrainingParamVisible();
	const [tabIdx, setTabIdx] = useState(initTabIdx);

	// Recipe関連タブ選択かつJobName選択中の場合は Recipeエリアを表示
	const recipeVisible =
		tabIdx === recipeVisibleIdx && selectedResultsJobName.length > 0;
	// Modelタブ選択中の場合は TrainingDataSettingエリアを表示
	const trainingDataVisible = tabIdx === trainingDataVisibleIdx;

	// 前回フェッチしたジョブ名を記録して、重複フェッチを防ぐ
	const lastFetchedJobNameRef = useRef("");

	useEffect(() => {
		setRecipeVisible(recipeVisible);
	}, [recipeVisible, setRecipeVisible]);

	useEffect(() => {
		if (
			recipeVisible &&
			selectedResultsJobName.length > 0 &&
			selectedResultsJobName !== lastFetchedJobNameRef.current
		) {
			lastFetchedJobNameRef.current = selectedResultsJobName;
			setRecipeCommonParam(selectedResultsJobName);
		}
	}, [selectedResultsJobName, recipeVisible, setRecipeCommonParam]);

	useEffect(() => {
		setTrainingParamVisible(trainingDataVisible);
	}, [setTrainingParamVisible, trainingDataVisible]);

	return { setTabIdx };
};
