import { useAtomCallback } from "jotai/utils";
import {
	type Dispatch,
	type SetStateAction,
	useCallback,
	useEffect,
	useState,
} from "react";

import { useAtomValue } from "jotai";
import { TRAININGPROGRESS_SHOW_INTERVAL } from "~/config";
import type { SearchParam, Sort } from "~/features/job-manager-info/types";
import { getTrainingProgressList } from "../api/getTrainingProgressList";
import type { TrainingProgressInfo } from "../types";
import { cancellingTrainingIdsAtom } from "./useCancelTrainingProgressInfo";

// 進捗情報データの初期ソート設定
// 全て submitDate を持つ前提としている
export const DEFAULT_SORT: Sort[] = [
	{
		field: "submitDate",
		direction: "desc",
	},
];

/**
 * 1行分の進捗情報データを2行に分割
 * @param progressInfo 進捗情報データ
 * @param idx 行インデクス
 * @returns 進捗情報データ配列
 */
export function splitProgressInfo(
	progressInfo: TrainingProgressInfo,
	idx: number,
): TrainingProgressInfo[] {
	return [
		{
			...progressInfo,
			idx,
		},
		{
			...progressInfo,
			idx: idx + 1,
		},
	];
}

/**
 * 進捗情報を表示用に、文字列変換
 * @param progressInfo 進捗情報データ
 * @param cancelingIds キャンセル中idリスト

 * @returns 進捗情報データ
 */
function convertProgressInfo(
	progressInfo: TrainingProgressInfo,
	cancelingIds: number[],
): TrainingProgressInfo {
	return {
		...progressInfo,
		status: cancelingIds.includes(progressInfo.id)
			? `${progressInfo.status}(Cancelling)`
			: progressInfo.status,
	};
}

interface UseTrainingProgressInfo {
	trainingProgressInfos: TrainingProgressInfo[];
	setSort: Dispatch<SetStateAction<Sort[]>>;
	isQueuing: (modelName: string) => boolean;
}

export const useTrainingProgressInfo = (
	defaultSort = DEFAULT_SORT,
): UseTrainingProgressInfo => {
	const [trainingProgressInfos, setTrainingProgressInfos] = useState<
		TrainingProgressInfo[]
	>([]);
	const [sort, setSort] = useState(defaultSort);
	const [fetchControler, setFetchControler] = useState(new AbortController());

	const cancellingTrainingIds = useAtomValue(cancellingTrainingIdsAtom);
	useEffect(() => {
		if (cancellingTrainingIds.length === 0) return;
		setTrainingProgressInfos((prev) =>
			prev.map((info) =>
				convertProgressInfo(
					info as TrainingProgressInfo,
					cancellingTrainingIds,
				),
			),
		);
	}, [cancellingTrainingIds]);

	const refreshTrainingProgressInfo = useAtomCallback(
		// biome-ignore lint/correctness/useExhaustiveDependencies: fetchControlerは監視対象外(追加した場合は、常に呼ばれintervalが使用できないため)
		useCallback(
			(get, set) => {
				const param: SearchParam = {
					start: 0,
					limit: 10000,
					sort: sort,
				};
				getTrainingProgressList(param, fetchControler.signal)
					.then(async (res) => {
						// 表に含まれなくなったTrainingIDをキャンセル中TrainingIDリストから除く
						const cancellingTrainingIds = get(cancellingTrainingIdsAtom).filter(
							(r) => res.results.map((r) => r.id).includes(r),
						);
						set(cancellingTrainingIdsAtom, cancellingTrainingIds);

						// ProgressMonitor画面表示用にTraining進捗情報に2行に分割
						setTrainingProgressInfos(
							res.results
								.flatMap((val, idx) => splitProgressInfo(val, idx * 2))
								.map((r) =>
									convertProgressInfo(
										r as TrainingProgressInfo,
										cancellingTrainingIds,
									),
								),
						);
					})
					.catch((error) => {
						if (error.name === "AbortError") return;
						console.error("getTrainingProgressList fetch fail.", error);
					});
			},
			[sort],
		),
	);

	// 定期的にTrainingProgressInfoを更新
	useEffect(() => {
		const controller = new AbortController();
		setFetchControler(controller);

		// 最初の１回は即実行
		refreshTrainingProgressInfo();

		// 2回目以降定期的に再取得
		const intervalId = setInterval(() => {
			refreshTrainingProgressInfo();
		}, TRAININGPROGRESS_SHOW_INTERVAL);

		return () => {
			controller.abort();
			clearInterval(intervalId);
		};
	}, [refreshTrainingProgressInfo]);

	const isQueuing = useCallback(
		(modelName: string): boolean => {
			return trainingProgressInfos.some(
				(e) => "modelName" in e && e.modelName === modelName,
			);
		},
		[trainingProgressInfos],
	);

	return {
		trainingProgressInfos,
		setSort,
		isQueuing,
	};
};
