import { atom, useAtom, useAtomValue } from "jotai";
import { useState } from "react";

import type { ErrorMessage } from "~/components/types/ErrorMessageType";
import { useDefect } from "~/features/info-and-defect/hooks/useDefect";
import { useTestRunDefectInfo } from "~/features/info-and-defect/hooks/useDefectInfo";
import { useResultName } from "~/features/misc/hooks/useResultName";

import { postReTestRun } from "../api";
import type { ReTestRunParam } from "../types";

import { adcSelector } from "./useADCParam";
import { selectedAreaNoAtom } from "./useAreaNos";
import { correctionSelector } from "./useCorrectionParam";
import { useImportedDesign } from "./useImportedParam";
import { inspectionSelector } from "./useInspectionParam";
import { matchingSelector } from "./useMatchingParam";
import {
	useDesignType,
	useNoDesign,
	useNumDefects,
} from "./useRecipeCommonParam";
import { useTestRunState } from "./useTestRunState";

const testRunProcessedCountAtom = atom(0);

const idNotFoundError = (): ErrorMessage => {
	// TODO エラー仕様未決定
	return [
		{
			loc: [],
			msg: "id not found.",
			type: "",
		},
	];
};

interface UseReTestRun {
	testRunProcessedCount: number;
	isTestRunning: boolean;
	isSuccess: boolean;
	errorMessage?: ErrorMessage;
	doReTestRun: () => () => void;
}
export const useReTestRun = (): UseReTestRun => {
	const { resultName } = useResultName();
	const [numDefects] = useNumDefects();
	const noDesign = useNoDesign();
	const designType = useDesignType();
	const { designLayer } = useImportedDesign();
	const selectedAreaNo = useAtomValue(selectedAreaNoAtom);
	const matchings = useAtomValue(matchingSelector);
	const adcs = useAtomValue(adcSelector);
	const inspections = useAtomValue(inspectionSelector);
	const corrections = useAtomValue(correctionSelector);
	const { updateTestRunDefect } = useDefect();
	const { updateTestRunDefectInfoTable } = useTestRunDefectInfo();
	const { testRunId } = useTestRunState();
	const [testRunProcessedCount, setTestRunProcessedCount] = useAtom(
		testRunProcessedCountAtom,
	);

	const [isTestRunning, setIsTestRunning] = useState(false);
	const [isSuccess, setIsSuccess] = useState(false);
	const [errorMessage, setErrorMessage] = useState<ErrorMessage>();

	const createReTestRunParam = (): ReTestRunParam => {
		return {
			numDefects,
			designLayer:
				!noDesign && designType === "Imported" ? designLayer : undefined,
			matching: matchings?.get(selectedAreaNo),
			inspection: inspections?.get(selectedAreaNo),
			correction: corrections?.get(selectedAreaNo),
			adc: adcs?.get(selectedAreaNo),
		};
	};

	const doPostReTestRun = (
		testRunID: string,
		postData: ReTestRunParam,
		controller: AbortController,
	): void => {
		postReTestRun(resultName, testRunID, postData, controller.signal)
			.then(() => {
				setIsTestRunning(false);
				setIsSuccess(true);
				setTestRunProcessedCount(testRunProcessedCount + 1);
				updateTestRunDefect();
				updateTestRunDefectInfoTable();
			})
			.catch((error) => {
				if (error.name === "AbortError") return;
				console.error("postReTestRun fail.", error);
				const response: Response | undefined = error.response;
				void response?.json().then((data) => {
					setErrorMessage(data);
				});
				setIsTestRunning(false);
			});
	};

	const doReTestRun = (): (() => void) => {
		if (resultName.length === 0) return () => {};
		const postData = createReTestRunParam();
		const controller = new AbortController();
		setIsSuccess(false);
		setIsTestRunning(true);
		setErrorMessage(undefined);
		// 最初にPOST パラメータ用の ID を取得
		if (testRunId == null || testRunId === "") {
			setErrorMessage(idNotFoundError());
		} else {
			doPostReTestRun(testRunId, postData, controller);
		}
		return () => {
			controller.abort();
		};
	};
	return {
		testRunProcessedCount,
		isTestRunning,
		isSuccess,
		errorMessage,
		doReTestRun,
	};
};
