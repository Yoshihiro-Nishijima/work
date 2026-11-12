import { atom, useAtomValue, useSetAtom } from "jotai";
import { useCallback, useEffect } from "react";

import { resultNameAtom } from "~/features/misc/hooks/useResultName";

import { Point } from "pixi.js";
import { useSetSelectedChip } from "~/features/misc/hooks/useMapSelectionStatus";
import { getFovInfo, postTestRunInit } from "../api";
import type { modeFov } from "../types";

/** TestRun画面で扱うsFov情報 */
const sFovAtom = atom<modeFov | undefined>(undefined);

/* TestRunId */
const testRunIdAtom = atom("");

/** TestRun用状態初期化用Atom */
const initTestRunStateAtom = atom(
	null,
	async (get, set, mFovNo: number, sFovNo: number) => {
		const resultName = get(resultNameAtom);
		if (resultName == null || resultName === "" || !mFovNo || !sFovNo) return;

		const controller = new AbortController();
		// TestRunId取得
		postTestRunInit(resultName, mFovNo, sFovNo, controller.signal)
			.then((testRunId: string) => set(testRunIdAtom, testRunId ?? ""))
			.catch((error) => {
				if (error.name === "AbortError") return;
				console.error("getTestRunId fetch fail.", error);
			});

		// sFov情報取得
		getFovInfo({ resultName, mFovNo, sFovNo }, controller.signal)
			.then((fov) => set(sFovAtom, fov))
			.catch((error) => {
				if (error.name === "AbortError") return;
				console.error("getFovInfo fetch fail.", error);
			});
		return () => {
			controller.abort();
		};
	},
);

export interface UseTestRunState {
	testRunId: string;
	sFov?: modeFov;
}
export const useTestRunState = (): UseTestRunState => {
	const testRunId = useAtomValue(testRunIdAtom);
	const sFov = useAtomValue(sFovAtom);
	return { testRunId, sFov };
};

export const useSetTestRunState = () => {
	const setSelectedChip = useSetSelectedChip();
	const setInitTestRunState = useSetAtom(initTestRunStateAtom);
	const sFov = useAtomValue(sFovAtom);
	const initTestRunState = useCallback(
		(mFovNo: number, sFovNo: number) => setInitTestRunState(mFovNo, sFovNo),
		[setInitTestRunState],
	);

	useEffect(() => {
		if (sFov == null) return;
		setSelectedChip(new Point(sFov.chipX, sFov.chipY));
	}, [sFov, setSelectedChip]);

	return { initTestRunState };
};
