import { atom, useAtom } from "jotai";
import {
	type ApiErrorInfo,
	extractApiErrorInfo,
	extractApiErrorMessage,
} from "lib/extractApiErrorMessage";
import { useCallback } from "react";
import { deleteDeleteProgress } from "../api/deleteDeleteProgress";
import { postRetryDeleteProgress } from "../api/postRetryDeleteProgress";
import type { DeleteProgressInfo } from "../types";

// 選択中行（存在しなければ undefined）
const selectedRowAtom = atom<DeleteProgressInfo | undefined>(undefined);

// リトライ可否(エラー時間あり)
const retryableAtom = atom((get) => {
	const row = get(selectedRowAtom);
	if (!row) return false;
	return row.deleteStatus === "Failed";
});

interface UseDeleteProgressInfo {
	selectedRow: DeleteProgressInfo | undefined;
	setSelectedRow: (row: DeleteProgressInfo | undefined) => void;
	restore: () => Promise<ApiErrorInfo | undefined>;
	retryable: boolean;
	retry: () => Promise<string | undefined>;
}

export const useDeleteProgressInfo = (): UseDeleteProgressInfo => {
	const [selectedRow, setSelectedRow] = useAtom(selectedRowAtom);
	const [retryable] = useAtom(retryableAtom);

	const retry = useCallback(async (): Promise<string | undefined> => {
		if (!selectedRow || !retryable) return undefined;
		const identifier = selectedRow.name ?? selectedRow.toolData;
		if (!identifier) return undefined;
		const controller = new AbortController();
		try {
			await postRetryDeleteProgress(identifier, controller.signal);
			return undefined;
		} catch (error: unknown) {
			const msg = await extractApiErrorMessage(error);
			// silentAbort:true なので AbortError 時は undefined を返し、それ以外はメッセージ(空文字含む)を返す
			if (msg === undefined) return undefined;
			console.error("retryDeleteProgress fail.", msg, error);
			return msg.length === 0 ? "Retry fail." : msg;
		} finally {
			controller.abort();
		}
	}, [selectedRow, retryable]);

	const restore = useCallback(async (): Promise<ApiErrorInfo | undefined> => {
		if (!selectedRow) return undefined;
		const name = selectedRow.name ?? selectedRow.toolData;
		if (!name) return undefined;
		const controller = new AbortController();
		try {
			await deleteDeleteProgress({ name }, controller.signal);
			return undefined;
		} catch (error: unknown) {
			const info = await extractApiErrorInfo(error);
			if (info.aborted) return undefined;
			console.error("restoreDeleteProgress fail.", info, error);
			// HTTPステータスコードによって処理を分岐させる必要があるのでエラー内容ごと返す
			return info;
		} finally {
			controller.abort();
		}
	}, [selectedRow]);

	return {
		selectedRow,
		setSelectedRow,
		restore,
		retryable,
		retry,
	};
};
