import { extractApiErrorInfo } from "lib/extractApiErrorMessage";
import { deleteLockToolData } from "../api/deleteLockToolData";
import { getResults } from "../api/getResults";
import { postDeleteQueue } from "../api/postDeleteQueue";
import { postLockToolData } from "../api/postLockToolData";
import type { Result, SearchParam } from "../types";

interface UseDeleteToolData {
	getResultsByToolData: (toolDatas: string[]) => Promise<Result[] | string>;
	lockToolData: (name: string) => Promise<string | undefined>;
	unlockToolData: (name: string) => Promise<string | undefined>;
	deleteToolData: (toolDatas: string[]) => Promise<string | undefined>;
}

export const useDeleteToolData = (): UseDeleteToolData => {
	// ToolDataに紐づくResult一覧を取得
	const getResultsByToolData = async (
		toolDatas: string[],
	): Promise<Result[] | string> => {
		if (toolDatas.length === 0) return [];
		try {
			const controller = new AbortController();
			const param: SearchParam = {
				start: 0,
				limit: 10000,
				filter: {
					items: [{ field: "toolData", operator: "isAnyOf", value: toolDatas }],
				},
				sort: [{ field: "executionData", direction: "asc" }],
			};
			const results = (await getResults(param, controller.signal)).results;
			// ロック中のデータ含まれていたらエラー応答
			if (results.some((r) => r.isLocked > 0)) {
				return (
					"Failed to append the Result data to Delete List. \r\n" +
					"Please confirm that the selected Result data is not locked."
				);
			}
			return results;
		} catch (error) {
			const info = await extractApiErrorInfo(error);
			if (info.aborted) return [];
			if (info.message == null) return "getResults fail.";
			console.error("getResults fail.", info.message, error);
			return info.message;
		}
	};

	// ToolData をロック状態へ
	const lockToolData = async (name: string): Promise<string | undefined> => {
		if (!name) return undefined;
		const controller = new AbortController();
		try {
			await postLockToolData(name, controller.signal);
			return undefined;
		} catch (error) {
			const info = await extractApiErrorInfo(error);
			if (info.aborted) return undefined;
			if (info.message == null) return "lockToolData fail.";
			console.error("lockToolData fail.", info.message, error);
			return info.message;
		}
	};

	// ToolData のロック解除
	const unlockToolData = async (name: string): Promise<string | undefined> => {
		if (!name) return undefined;
		const controller = new AbortController();
		try {
			await deleteLockToolData(name, controller.signal);
			return undefined;
		} catch (error) {
			const info = await extractApiErrorInfo(error);
			if (info.aborted) return undefined;
			if (info.message == null) return "unlockToolData fail.";
			console.error("unlockToolData fail.", info.message, error);
			return info.message;
		}
	};

	// ToolData削除
	const deleteToolData = async (
		toolDatas: string[],
	): Promise<string | undefined> => {
		if (!toolDatas || toolDatas.length === 0) return undefined;
		const controller = new AbortController();
		try {
			await postDeleteQueue({ toolDatas }, controller.signal);
			return undefined;
		} catch (error) {
			const info = await extractApiErrorInfo(error);
			if (info.aborted) return undefined;
			if (info.message == null) return "deleteToolData fail.";
			console.error("deleteToolData fail.", info.message, error);
			return info.message;
		}
	};

	return {
		getResultsByToolData,
		lockToolData,
		unlockToolData,
		deleteToolData,
	};
};
