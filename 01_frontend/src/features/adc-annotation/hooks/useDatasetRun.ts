import { atom, useAtom } from "jotai";
import { atomWithReset, useResetAtom } from "jotai/utils";
import { useCallback } from "react";
import { postDatasetRun } from "~/features/adc-annotation/api/postDatasetRun";
import { extractApiErrorInfo } from "~/lib/extractApiErrorMessage";
import { useDataset } from "./useDataset";
import { useDatasetDefect } from "./useDatasetDefect";

export interface UseDatasetRun {
	runState: RunState;
	message?: string;
	runDataset: (adcModel?: string) => () => void;
	resetRun: () => void;
}

const RunState = {
	NOT_STARTED: "NOT_STARTED",
	IN_PROGRESS: "IN_PROGRESS",
	SUCCESS: "SUCCESS",
	FAILURE: "FAILURE",
} as const;
type RunState = (typeof RunState)[keyof typeof RunState];

const runStateAtom = atomWithReset<RunState>("NOT_STARTED");
const messageAtom = atom<string | undefined>(undefined);

export const useDatasetRun = (): UseDatasetRun => {
	const { datasetName } = useDataset();
	const [runState, setRunState] = useAtom(runStateAtom);
	const resetRunState = useResetAtom(runStateAtom);

	const [message, setMessage] = useAtom(messageAtom);
	const { setDatasetDefect } = useDatasetDefect();

	const resetRun = useCallback(() => {
		resetRunState();
		setMessage(undefined);
	}, [resetRunState, setMessage]);

	const runDataset = useCallback(
		(adcModel?: string): (() => void) => {
			const controller = new AbortController();

			setMessage(undefined);
			setRunState("IN_PROGRESS");

			postDatasetRun(datasetName, adcModel, controller.signal)
				.then(() => {
					if (controller.signal.aborted) return;
					if (adcModel) {
						setMessage(
							`Dataset "${datasetName}" Model "${adcModel}" run successfully.`,
						);
					} else {
						setMessage(`Dataset "${datasetName}" run successfully.`);
					}
					setRunState("SUCCESS");
					setDatasetDefect();
				})
				.catch(async (e) => {
					const info = await extractApiErrorInfo(e);
					// AbortError 時は RunStateを元に戻す
					if (info.aborted) {
						resetRun();
						return;
					}
					setRunState("FAILURE");
					setMessage(info.message ?? "Run failed.");
				});
			return () => controller.abort();
		},
		[datasetName, setDatasetDefect, setRunState, setMessage, resetRun],
	);

	return {
		runState,
		message,
		runDataset,
		resetRun,
	};
};
