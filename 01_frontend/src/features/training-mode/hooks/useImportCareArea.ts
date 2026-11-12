import { useAtom } from "jotai";
import { atomWithReset, useResetAtom } from "jotai/utils";
import { useCallback, useState } from "react";
import type { Dispatch, SetStateAction } from "react";

import { tableFromIPC } from "@apache-arrow/ts";

import { useResultName } from "~/features/misc/hooks/useResultName";
import { useSelectedSFovImageIdList } from "~/features/misc/hooks/useSelectedSFovImageIdList";
import { getCareAreaFile } from "../api/getCareAreaFile";
import type { GetCareAreaParam } from "../type";

/* ファイル内容読み込み＆設定処理 */
export interface UseImportCareArea {
	importCareArea: () => void;
	importCareAreaMessage: string[];
	setImportCareAreaMessage: Dispatch<SetStateAction<string[]>>;
	resetMessage: () => void;
	isError: boolean;
	setIsError: Dispatch<SetStateAction<boolean>>;
}

const importCareAreaMessageAtom = atomWithReset<string[]>([]);

export const useImportCareArea = (): UseImportCareArea => {
	const { addById } = useSelectedSFovImageIdList();
	const [importCareAreaMessage, setImportCareAreaMessage] = useAtom(
		importCareAreaMessageAtom,
	);
	const resetImportCareAreaMessage = useResetAtom(importCareAreaMessageAtom);
	const [isError, setIsError] = useState(false);
	const { resultName } = useResultName();

	// BulkImport情報を読み込み画面に反映
	const importCareArea = useCallback(() => {
		const controller = new AbortController();
		const param: GetCareAreaParam = {
			resultName,
		};
		getCareAreaFile(param, controller.signal)
			.then((res: ArrayBuffer) => {
				const table = tableFromIPC(res);
				const imageNos: number[] = Array.from(
					table.getChildAt(0)?.toArray(),
				).map((e) => Number(e));
				addById(imageNos);
				setIsError(false);
				//TODO メッセージは暫定
				setImportCareAreaMessage(["CareArea Data added."]);
			})
			.catch((error) => {
				//TODO エラーメッセージは暫定
				setIsError(true);
				setImportCareAreaMessage(["Could not read CareArea Data."]);

				if (error.name === "AbortError") return;
				console.error("getCareAreaFile fetch fail.", error);
			});

		return () => {
			controller.abort();
		};
	}, [addById, setImportCareAreaMessage, resultName]);

	const resetMessage = () => {
		resetImportCareAreaMessage();
	};

	return {
		importCareArea,
		importCareAreaMessage,
		setImportCareAreaMessage,
		resetMessage,
		isError,
		setIsError,
	};
};
