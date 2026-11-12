import { useModelDetail } from "~/features/training-param-setting/hooks/useModelDetail";

import { atom, useAtom, useAtomValue, useSetAtom } from "jotai";
import { useCallback, useState } from "react";
import type { ErrorMessage } from "~/components/types/ErrorMessageType";
import { deleteADCModel } from "~/features/adc/api/deleteADCModel";
import { useResultName } from "~/features/misc/hooks/useResultName";
import { selectedSFovImageIdSetReadAtom } from "~/features/misc/hooks/useSelectedSFovImageIdList";
import { deleteTrainingModel } from "~/features/training-param-setting/api/deleteTrainingModel";
import { useSelectedModel } from "~/features/training-param-setting/hooks/useSelectedModel";
import type { TrainingModelDeleteParam } from "~/features/training-param-setting/types";
import { addSegmentationTrainingJob } from "../api/addSegmentationTrainingJob";
import { addTrainingJob } from "../api/addTrainingJob";
import type { TrainingType } from "../type";
import { useModelNameParam } from "./useModelNameParam";
import { useTrainingTypeParam } from "./useTrainingTypeParam";

interface UseDeleteTrainingModel {
	setIsTrainingJobQueued: (isTrainingJobQueued: boolean) => void;
	doDeleteTrainingModel: (
		deleteTargetTrainingType: TrainingType,
		deleteTargetModelName: string,
	) => () => void;
	isDeleted: boolean | undefined;
	resetDeleted: () => void;
}
export const useDeleteTrainingModel = (): UseDeleteTrainingModel => {
	const [isDeleted, setIsDeleted] = useState<boolean | undefined>(undefined);
	const resetDeleted = useCallback(() => setIsDeleted(undefined), []);

	const doDeleteTrainingModel = (
		deleteTargetTrainingType: TrainingType,
		deleteTargetModelName: string,
	): (() => void) => {
		if (deleteTargetModelName.length === 0) return () => {};
		// Model一覧削除API実行
		const controller = new AbortController();
		const param: TrainingModelDeleteParam = {
			trainingType: deleteTargetTrainingType,
			modelName: deleteTargetModelName,
		};
		deleteTrainingModel(param, controller.signal)
			.then((_res) => {
				//削除結果を設定
				setIsDeleted(true);
			})
			.catch((error) => {
				if (error.name === "AbortError") return;
				console.error("deleteTrainingModel fail.", error);
				//削除結果を設定
				setIsDeleted(false);
			});
		return () => {
			controller.abort();
		};
	};

	return {
		setIsTrainingJobQueued: useSetAtom(isTrainingJobQueuedAtom),
		doDeleteTrainingModel,
		isDeleted,
		resetDeleted,
	};
};

interface UseTrainingQueue {
	isRequesting: boolean;
	isSegmentation: boolean | undefined;
	doStartTraining: (isBaseModelUsing?: boolean) => () => void;
	doStartSegmentationTraining: (isBaseModelUsing?: boolean) => () => void;
	informationMessage: string[] | undefined;
	errorMessage: ErrorMessage | undefined;
	isTrainingJobQueued: boolean;
	setIsTrainingJobQueued: (isTrainingJobQueued: boolean) => void;
	doDeleteTrainingModel: (
		deleteTargetTrainingType: TrainingType,
		deleteTargetModelName: string,
	) => () => void;
	doDeleteADCModel: (deleteTargetResultName: string) => () => void;
	isDeleted: boolean | undefined;
	resetDeleted: () => void;
}

const isTrainingJobQueuedAtom = atom(false);

export const useTrainingQueue = (): UseTrainingQueue => {
	const { trainingType } = useTrainingTypeParam();
	const { modelName, baseModelName } = useModelNameParam();
	const { getExecuteTrainingParam } = useModelDetail();
	const { selectedModel } = useSelectedModel();
	const selectedImageIdSet = useAtomValue(selectedSFovImageIdSetReadAtom);
	const { resultName } = useResultName();

	const [isRequesting, setIsRequesting] = useState(false);
	const [isSegmentation, setIsSegmentation] = useState<boolean | undefined>(
		undefined,
	);
	const [informationMessage, setInformationMessage] = useState<
		string[] | undefined
	>(undefined);
	const [errorMessage, setErrorMessage] = useState<ErrorMessage | undefined>(
		undefined,
	);
	const [isTrainingJobQueued, setIsTrainingJobQueued] = useAtom(
		isTrainingJobQueuedAtom,
	);
	const [isDeleted, setIsDeleted] = useState<boolean | undefined>(undefined);

	const resetDeleted = useCallback(() => setIsDeleted(undefined), []);

	const doStartTraining = (isBaseModelUsing?: boolean): (() => void) => {
		const controller = new AbortController();
		const param = getExecuteTrainingParam();
		param.trainingType = trainingType;
		param.modelName = modelName;
		if (isBaseModelUsing) {
			param.baseTrainingType = trainingType;
			param.baseModelName = baseModelName;
			param.resultName = selectedModel?.resultName ?? "";
		} else {
			param.resultName = resultName;
			param.imageIdList = [...selectedImageIdSet];
		}

		setInformationMessage(undefined);
		setErrorMessage(undefined);
		setIsSegmentation(false);
		setIsRequesting(true);
		setIsTrainingJobQueued(false);

		// TODO API詳細未定のため、受信後処理,メッセージ等は暫定
		addTrainingJob(param, controller.signal)
			.then((res) => {
				setInformationMessage(["Success queued training Job."]);
				setIsRequesting(false);
				setIsTrainingJobQueued(true);
			})
			.catch((error) => {
				if (error.name === "AbortError") return;
				setErrorMessage([
					{ loc: [], msg: "Fail queued training Job.", type: "" },
				]);
				setIsRequesting(false);
				console.error("addTrainingJob fail.", error);
			});
		return () => {
			controller.abort();
		};
	};

	const doStartSegmentationTraining = (
		isBaseModelUsing?: boolean,
	): (() => void) => {
		const controller = new AbortController();
		const param = getExecuteTrainingParam();
		param.trainingType = trainingType;
		param.modelName = modelName;
		if (isBaseModelUsing) {
			param.baseTrainingType = trainingType;
			param.baseModelName = baseModelName;
			param.resultName = selectedModel?.resultName ?? "";
		} else {
			param.resultName = resultName;
			param.imageIdList = [...selectedImageIdSet];
		}

		setInformationMessage(undefined);
		setErrorMessage(undefined);
		setIsSegmentation(true);
		setIsRequesting(true);

		// TODO API詳細未定のため、受信後処理,メッセージ等は暫定
		addSegmentationTrainingJob(param, controller.signal)
			.then((res) => {
				setInformationMessage(["Success queued segmentation training Job"]);
				setIsRequesting(false);
			})
			.catch((error) => {
				if (error.name === "AbortError") return;
				setErrorMessage([
					{
						loc: [],
						msg: "Fail queued segmentation training Job.",
						type: "",
					},
				]);
				setIsRequesting(false);
				console.error("addSegmentationTrainingJob fail.", error);
			});
		return () => {
			controller.abort();
		};
	};

	const doDeleteTrainingModel = (
		deleteTargetTrainingType: TrainingType,
		deleteTargetModelName: string,
	): (() => void) => {
		if (deleteTargetModelName.length === 0) return () => {};
		// Model一覧削除API実行
		const controller = new AbortController();
		const param: TrainingModelDeleteParam = {
			trainingType: deleteTargetTrainingType,
			modelName: deleteTargetModelName,
		};
		deleteTrainingModel(param, controller.signal)
			.then((_res) => {
				//削除結果を設定
				setIsDeleted(true);
			})
			.catch((error) => {
				if (error.name === "AbortError") return;
				console.error("deleteTrainingModel fail.", error);
				//削除結果を設定
				setIsDeleted(false);
			});
		return () => {
			controller.abort();
		};
	};

	const doDeleteADCModel = (deleteTargetResultName: string): (() => void) => {
		if (deleteTargetResultName.length === 0) return () => {};
		// Model一覧削除API実行
		const controller = new AbortController();
		deleteADCModel(deleteTargetResultName, controller.signal)
			.then((_res) => {
				//削除結果を設定
				setIsDeleted(true);
			})
			.catch((error) => {
				if (error.name === "AbortError") return;
				console.error("doDeleteADCModel fail.", error);
				//削除結果を設定
				setIsDeleted(false);
			});
		return () => {
			controller.abort();
		};
	};

	return {
		isRequesting,
		isSegmentation,
		doStartTraining,
		doStartSegmentationTraining,
		informationMessage,
		errorMessage,
		isTrainingJobQueued,
		setIsTrainingJobQueued,
		doDeleteTrainingModel,
		doDeleteADCModel,
		isDeleted,
		resetDeleted,
	};
};
