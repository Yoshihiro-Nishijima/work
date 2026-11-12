import { atom, useAtom, useAtomValue } from "jotai";
import { atomWithRefresh, useResetAtom } from "jotai/utils";
import type { Dispatch, SetStateAction } from "react";

import { getResultsRecord } from "../api/getResultsRecord";
import type { ResultsRecord } from "../types";

/**
 * 画面表示時のResult関連データを管理
 */

/**
 *  ResultNameを管理 \
 * あちこちで使用するのでexport \
 * TODO APIフックに埋め込んでしまったほうがいいのかも？
 */
export const resultNameAtom = atom("");

const DefaultResultsRecord: ResultsRecord = {
	toolData: "",
	class: "",
	defectCount: 0,
	defectDensity: 0,
};

/** ResultNameに該当するResultRecord */
export const resultsRecordSelector = atom(
	async (get): Promise<ResultsRecord> => {
		const resultName = get(resultNameAtom);
		if (resultName.length === 0) return DefaultResultsRecord;
		const controller = new AbortController();
		return await getResultsRecord(resultName, controller.signal)
			.then((res) => res)
			.catch((error) => {
				if (error.name !== "AbortError")
					console.error("getResultsRecord fetch fail.", error);
				return DefaultResultsRecord;
			});
	},
);
const refreshResultsRecordSelector = atomWithRefresh(
	async (get) => await get(resultsRecordSelector),
);

/** ResultRecord取得用のラッパー(コンポーネントからJotaiを意識せずに利用) */
interface UseResultsRecord {
	resultsRecord: ResultsRecord;
	refreshResultsRecord: () => void;
}
export const useResultsRecord = (): UseResultsRecord => {
	const resultsRecord = useAtomValue(resultsRecordSelector);
	const refreshResultsRecord = useResetAtom(refreshResultsRecordSelector);

	return { resultsRecord, refreshResultsRecord };
};

export interface UseResultName {
	resultName: string;
	toolData: string;
	setResultName: Dispatch<SetStateAction<string>>;
}

export const useResultName = (): UseResultName => {
	const [resultName, setResultName] = useAtom(resultNameAtom);
	const toolData = resultToTool(resultName);
	return { resultName, toolData, setResultName };
};

/**
 * ResultNameからToolDataNameを得る
 * @param resultName ResultName
 * @returns ToolDataName
 */
const resultToTool = (resultName: string): string => {
	const sp = resultName.split("_");
	return sp.slice(2).join("_");
};
