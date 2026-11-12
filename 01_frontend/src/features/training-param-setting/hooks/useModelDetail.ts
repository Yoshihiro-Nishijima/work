import { useEffect, useRef } from "react";

import { useRecipeCommonParams } from "~/features/recipe/hooks";
import { JobTypeList } from "~/features/recipe/types/CommonParam";
import { useModelNameParam } from "~/features/training-mode/hooks/useModelNameParam";
import { useTrainingTypeParam } from "~/features/training-mode/hooks/useTrainingTypeParam";
import type { ExecuteTrainingParam } from "~/features/training-mode/type";
import { getTrainingDetail } from "../api/getTrainingDetail";
import type { GetTrainingDetailParam } from "../types";
import { useModelData } from "./useModelData";
import { useSelectedModel } from "./useSelectedModel";
import { useTrainingParameterD2D } from "./useTrainingParametersD2D";
import { useTrainingParameterD2DB } from "./useTrainingParametersD2DB";

interface UseModelDetail {
	// Training実行用パラメータ取得
	getExecuteTrainingParam: () => ExecuteTrainingParam;
}

export const useModelDetail = (): UseModelDetail => {
	const { selectedModel } = useSelectedModel();
	const { setModelName, setIsValidModelName, setBaseModelName } =
		useModelNameParam();
	const { setJobType } = useRecipeCommonParams();
	const { setTrainingType } = useTrainingTypeParam();

	// TrainingParameterD2Dで使用
	const {
		trainingCountType,
		segmentsTrainingCountType,
		trainingCount,
		segmentsTrainingCount,
		clipLimitValue,
		blockSizeValue,
		sigmaColorValue,
		sigmaSpaceValue,
		ratioValue,
		numberOfSegmentsValue,
		dummyRatioValue,
		isBrightness,
		isBlur,
		isZoom,
		isSegmentation,
		setTrainingCountType,
		setSegmentsTrainingCountType,
		setTrainingCount,
		setSegmentsTrainingCount,
		setClipLimitValue,
		setBlockSizeValue,
		setSigmaColorValue,
		setSigmaSpaceValue,
		setRatioValue,
		setNumberOfSegmentsValue,
		setDummyRatioValue,
		setIsBrightness,
		setIsBlur,
		setIsZoom,
		setIsSegmentation,
		setMinValueTrainingParameterD2D,
	} = useTrainingParameterD2D();

	// TrainingParameterD2DBで使用
	const {
		iterationValue,
		isShadingCorrection,
		shadingLevelType,
		isGaussFilter,
		gaussFilterLevelType,
		isDyadic,
		setIterationValue,
		setIsShadingCorrection,
		setShadingLevelType,
		setIsGaussFilter,
		setGaussFilterLevelType,
		setIsDyadic,
		setMinValueTrainingParameterD2DB,
	} = useTrainingParameterD2DB();

	// trainingDataListのデータ管理用
	const { setModelDetailList, setMinValueModelData } = useModelData();

	// 前回処理したselectedModelを記憶（重複処理を防ぐため）
	const prevSelectedModelRef = useRef<string | null>(null);
	// 最小値設定済みフラグ（モデル選択されるまで一度だけ設定）
	const isMinValueSetRef = useRef(false);

	// selectedModelがundefinedのときの最小値設定処理
	// biome-ignore lint/correctness/useExhaustiveDependencies: setterの監視は不要
	useEffect(() => {
		if (selectedModel == null) {
			// モデル未選択で、まだ最小値を設定していない場合のみ設定
			if (!isMinValueSetRef.current) {
				setMinValueModelData();
				setMinValueTrainingParameterD2D();
				setMinValueTrainingParameterD2DB();
				setModelName("");
				setIsValidModelName(false);
				setBaseModelName("");
				prevSelectedModelRef.current = null;
				isMinValueSetRef.current = true;
			}
		} else {
			// モデルが選択された場合、フラグをリセット（次回未選択時に再設定可能にする）
			isMinValueSetRef.current = false;
		}
	}, [selectedModel]);

	// biome-ignore lint/correctness/useExhaustiveDependencies: setterの監視は不要
	useEffect(() => {
		// モデルが選択されていない場合は何もしない
		if (selectedModel == null) {
			return;
		}

		// 同じモデルが再選択された場合はスキップ
		const currentModelKey = `${selectedModel.type}-${selectedModel.modelName}`;
		if (prevSelectedModelRef.current === currentModelKey) {
			return;
		}
		prevSelectedModelRef.current = currentModelKey;

		// Training詳細取得API実行
		const controller = new AbortController();
		const param: GetTrainingDetailParam = {
			type: selectedModel.type,
			modelName: selectedModel.modelName,
		};
		getTrainingDetail(param, controller.signal)
			.then((res) => {
				setModelName(res.modelName);
				setIsValidModelName(true);
				setBaseModelName(res.modelName);
				if (JobTypeList.some((e) => e === res.jobType)) setJobType(res.jobType);

				setTrainingType(res.type);

				// TrainingDataリスト表示で使用
				const resTrainingDataList = [
					{ item: "Execution Date", value: res.executionDate },
					{ item: "JobType", value: res.jobType },
					{ item: "Process Time", value: res.processTime },
					{ item: "Images", value: res.images },
					{ item: "Class", value: res.class },
					{ item: "IDW", value: res.idw },
					{ item: "IDP", value: res.idp },
					{ item: "Recipe", value: res.recipe },
					{ item: "Comment", value: res.comment },
					{ item: "Result Name", value: res.resultName },
				];
				setModelDetailList(resTrainingDataList);

				// TrainingParameterD2Dで使用
				setTrainingCountType(res.trainingCountType);
				setSegmentsTrainingCountType(res.segmentsTrainingCountType);
				setTrainingCount(res.trainingCount);
				setSegmentsTrainingCount(res.segmentsTrainingCount);
				setClipLimitValue(res.clipLimit);
				setBlockSizeValue(res.blockSize);
				setSigmaColorValue(res.sigmaColor);
				setSigmaSpaceValue(res.sigmaSpace);
				setRatioValue(res.ratio);
				setNumberOfSegmentsValue(res.numberOfSegments);
				setDummyRatioValue(res.dummyRatio);
				setIsBrightness(res.brightness);
				setIsBlur(res.blur);
				setIsZoom(res.zoom);
				setIsSegmentation(res.segmentation);

				// TrainingParameterD2DBで使用
				setIterationValue(res.iteration);
				setIsShadingCorrection(res.shadingCorrection);
				setShadingLevelType(res.shadingLevel);
				setIsGaussFilter(res.gaussFilter);
				setGaussFilterLevelType(res.gaussFilterLevel);
				setIsDyadic(res.dyadic);
			})
			.catch((error) => {
				if (error.name === "AbortError") return;
				console.error("getTrainingData fail", error);
				// エラー時は前回の記憶をクリアして再試行可能にする
				prevSelectedModelRef.current = null;
			});
		return () => {
			controller.abort();
		};
	}, [selectedModel]);

	// hook読込時ではなく、呼び出し時に最新値が取得できるように関数を返す
	const getExecuteTrainingParam = (): ExecuteTrainingParam => {
		// trainingType, modelName, baseTrainingType, baseModelName, resultName, imageIdList は設定しない
		return {
			trainingType: "D2D",
			modelName: "",
			baseTrainingType: "",
			baseModelName: "",
			resultName: "",
			// D2D
			trainingCountType,
			segmentsTrainingCountType,
			trainingCount,
			segmentsTrainingCount,
			clipLimit: clipLimitValue,
			blockSize: blockSizeValue,
			sigmaColor: sigmaColorValue,
			sigmaSpace: sigmaSpaceValue,
			ratio: ratioValue,
			numberOfSegments: numberOfSegmentsValue,
			dummyRatio: dummyRatioValue,
			brightness: isBrightness,
			blur: isBlur,
			zoom: isZoom,
			segmentation: isSegmentation,
			// D2DB
			iteration: iterationValue,
			shadingCorrection: isShadingCorrection,
			shadingLevel: shadingLevelType,
			gaussFilter: isGaussFilter,
			gaussFilterLevel: gaussFilterLevelType,
			dyadic: isDyadic,

			imageIdList: [],
		};
	};

	return {
		// Training実行用パラメータ取得
		getExecuteTrainingParam,
	};
};
