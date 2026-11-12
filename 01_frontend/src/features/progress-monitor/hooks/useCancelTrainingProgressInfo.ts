import { atom, useAtom } from "jotai";
import { postCancelTraining } from "../api/postCancelTraining";
import type { CancelTrainingParam } from "../types";

/** ProgressMonitor画面でキャンセル中のTrainingIDリスト */
export const cancellingTrainingIdsAtom = atom<number[]>([]);

interface UseCancelTrainingProgressInfo {
	cancellingTrainingIds: number[];
	doCancel: (trainingId: number) => () => void;
}

export const useCancelTrainingProgressInfo =
	(): UseCancelTrainingProgressInfo => {
		const [cancellingTrainingIds, setCancellingTrainingIds] = useAtom(
			cancellingTrainingIdsAtom,
		);

		const doCancel = (trainingId: number): (() => void) => {
			const controller = new AbortController();
			const param: CancelTrainingParam = { id: trainingId };
			postCancelTraining(param, controller.signal)
				.then((_res) => {
					setCancellingTrainingIds([...cancellingTrainingIds, trainingId]);
				})
				.catch((error) => {
					if (error.name === "AbortError") return;
					console.error("postCancelTraining fail.", error);
				});
			return () => {
				controller.abort();
			};
		};

		return {
			cancellingTrainingIds,
			doCancel,
		};
	};
