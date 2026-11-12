import { useAtomCallback } from "jotai/utils";
import { useCallback, useEffect, useState } from "react";

import { atom, useAtomValue } from "jotai";
import { extractApiErrorInfo } from "lib/extractApiErrorMessage";
import { JOBPROGRESS_SHOW_INTERVAL } from "~/config";
import { getJobProgressList } from "../api/getJobProgressList";
import { postCancelJob } from "../api/postCancelJob";
import type { CancelParam } from "../types";
import type { JobProgressInfo } from "../types";

// 選択中行（存在しなければ undefined）
const selectedJobProgressAtom = atom<JobProgressInfo | undefined>(undefined);

/**
 * 1行分の進捗情報データを2行に分割
 * @param progressInfo 進捗情報データ
 * @param idx 行インデクス
 * @returns 進捗情報データ配列
 */
export function splitProgressInfo(
	progressInfo: JobProgressInfo,
	idx: number,
): object[] {
	return [
		{
			idx,
			id: progressInfo.id,
			status: progressInfo.status,
			processStatus: progressInfo.processStatus,
			executionDate: progressInfo.executionDate,
			jobType: progressInfo.jobType,
			class: progressInfo.class,
			idw: progressInfo.idw,
			idp: progressInfo.idp,
			recipe: progressInfo.recipe,
			port: progressInfo.port,
			slotNo: progressInfo.slotNo,
			lotID: progressInfo.lotID,
			processID: progressInfo.processID,
			operator: progressInfo.operator,
			numberOfImages: progressInfo.numberOfImages,
			numberOfFinished: progressInfo.numberOfFinished,
			name: progressInfo.name,
			cancelable: progressInfo.cancelable,
		},
		{
			idx: idx + 1,
			id: progressInfo.id,
			status: progressInfo.progress,
			executionDate: progressInfo.estimatedFinishDate,
		},
	];
}

interface UseJobProgressInfo {
	jobProgressInfos: object[];
	rowSelection: number[];
	selectedJobProgress: JobProgressInfo | undefined;
	setSelectedJobProgressIdx: (rowIdx: number) => void;
	cancelable: boolean;
	cancel: () => Promise<string | undefined>;
}

export const useJobProgressInfo = (): UseJobProgressInfo => {
	const [jobProgressInfos, setJobProgressInfos] = useState<object[]>([]);
	const [rowSelection, setRowSelection] = useState<number[]>([]);
	const [fetchControler, setFetchControler] = useState(new AbortController());
	const selectedJobProgress = useAtomValue(selectedJobProgressAtom);
	const cancelable = selectedJobProgress?.cancelable ?? false;

	const setSelectedJobProgressIdx = useAtomCallback(
		useCallback(
			(_get, set, rowIdx: number) => {
				if (Number.isNaN(rowIdx) || jobProgressInfos.length <= rowIdx) {
					set(selectedJobProgressAtom, undefined);
					return;
				}
				const [rowIdx1, rowIdx2] =
					rowIdx % 2 === 0 ? [rowIdx, rowIdx + 1] : [rowIdx - 1, rowIdx];
				const row1 = jobProgressInfos[rowIdx1] as JobProgressInfo;
				set(selectedJobProgressAtom, row1);
				setRowSelection([rowIdx1, rowIdx2]);
			},
			[jobProgressInfos],
		),
	);

	const searchJobProgressInfo = useAtomCallback(
		// biome-ignore lint/correctness/useExhaustiveDependencies: fetchControlerは監視対象外(追加した場合は、常に呼ばれintervalが使用できないため)
		useCallback((_, set): void => {
			getJobProgressList(fetchControler.signal)
				.then(async (res) => {
					// ProgressMonitor画面表示用にJob進捗情報に2行に分割
					setJobProgressInfos(
						res.flatMap((val, idx) => splitProgressInfo(val, idx * 2)),
					);
					if (res.length === 0) {
						set(selectedJobProgressAtom, undefined);
					}
				})
				.catch((error) => {
					if (error.name === "AbortError") return;
					console.error("getJobProgressList fetch fail.", error);
				});
		}, []),
	);

	useEffect(() => {
		const controller = new AbortController();
		setFetchControler(controller);

		// 初回読み込み
		searchJobProgressInfo();

		// 2回目以降定期的に再取得
		const intervalId = setInterval(() => {
			searchJobProgressInfo();
		}, JOBPROGRESS_SHOW_INTERVAL);

		return () => {
			controller.abort();
			clearInterval(intervalId);
		};
	}, [searchJobProgressInfo]);

	const cancel = useAtomCallback(
		useCallback(async (get, _): Promise<string | undefined> => {
			const jobProgress = get(selectedJobProgressAtom);
			if (!jobProgress || !jobProgress.cancelable) return undefined;
			const controller = new AbortController();
			const param: CancelParam = { name: jobProgress.name };
			try {
				await postCancelJob(param, controller.signal);
				return undefined;
			} catch (error: unknown) {
				const info = await extractApiErrorInfo(error);
				if (info.aborted) return undefined;
				console.error("postCancelJob fail.", info, error);
				return info.message;
			} finally {
				controller.abort();
			}
		}, []),
	);

	return {
		jobProgressInfos,
		rowSelection,
		selectedJobProgress,
		setSelectedJobProgressIdx,
		cancelable,
		cancel,
	};
};
