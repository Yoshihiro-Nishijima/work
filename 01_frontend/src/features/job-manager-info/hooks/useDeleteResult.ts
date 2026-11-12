import { extractApiErrorMessage } from "lib/extractApiErrorMessage";
import { deleteLockResult } from "../api/deleteLockResult";
import { postDeleteQueue } from "../api/postDeleteQueue";
import { postLastResultToolData } from "../api/postLastResultToolData";
import { postLockResult } from "../api/postLockResult";

interface UseDeleteResult {
	lockResult: (name: string) => Promise<string | undefined>;
	unlockResult: (name: string) => Promise<string | undefined>;
	checkLastResults: (names: string[]) => Promise<string[] | string | undefined>;
	deleteResults: (names: string[]) => Promise<string | undefined>;
}

export const useDeleteResult = (): UseDeleteResult => {
	// Results をロック状態へ (POST delete-queue/{name}/lock)
	const lockResult = async (name: string): Promise<string | undefined> => {
		if (!name) return undefined;
		const controller = new AbortController();
		try {
			await postLockResult(name, controller.signal);
			return undefined;
		} catch (error) {
			const message = await extractApiErrorMessage(error);
			if (message == null) return undefined;
			console.error("lockResults fail.", message, error);
			return message;
		}
	};

	// Results のロック解除 (DELETE delete-queue/{name}/lock)
	const unlockResult = async (name: string): Promise<string | undefined> => {
		if (!name) return undefined;
		const controller = new AbortController();
		try {
			await deleteLockResult(name, controller.signal);
			return undefined;
		} catch (error) {
			const message = await extractApiErrorMessage(error);
			if (message == null) return undefined;
			console.error("unlockResults fail.", message, error);
			return message;
		}
	};

	// 最後のResultとなるToolDataであれば取得
	const checkLastResults = async (
		names: string[],
	): Promise<string[] | string | undefined> => {
		if (!names || names.length === 0) return undefined;
		const controller = new AbortController();
		try {
			return await postLastResultToolData(names, controller.signal);
		} catch (error) {
			const message = await extractApiErrorMessage(error);
			if (message == null) return undefined;
			console.error("deleteResults fail.", message, error);
			return message;
		}
	};

	// Results を DeleteQueue へ追加 (POST delete-queue)
	const deleteResults = async (
		names: string[],
	): Promise<string | undefined> => {
		if (!names || names.length === 0) return undefined;
		const controller = new AbortController();
		try {
			await postDeleteQueue({ resultNames: names }, controller.signal);
			return undefined;
		} catch (error) {
			const message = await extractApiErrorMessage(error);
			if (message == null) return undefined;
			console.error("deleteResults fail.", message, error);
			return message;
		}
	};

	return {
		lockResult,
		unlockResult,
		checkLastResults,
		deleteResults,
	};
};
