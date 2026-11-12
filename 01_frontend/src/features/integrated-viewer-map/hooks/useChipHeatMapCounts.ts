import { Point } from "pixi.js";
import { useEffect, useMemo, useRef, useState } from "react";

import {
	getChipHeatMapCounts,
	type ChipHeatMapCount,
} from "~/features/integrated-viewer-map/api/getChipHeatMapCounts";
import { useIdw } from "~/features/map/hooks/useIdw";
import { useResultName } from "~/features/misc/hooks/useResultName";

export type ChipHeatMapCountsState =
	| {
			status: "idle";
			counts: Map<string, number>;
			isReady: false;
			maxChipCount: null;
	  }
	| {
			status: "loading";
			counts: Map<string, number>;
			isReady: false;
			maxChipCount: null;
	  }
	| {
			status: "success";
			counts: Map<string, number>;
			isReady: boolean;
			maxChipCount: number;
	  }
	| {
			status: "error";
			counts: Map<string, number>;
			isReady: false;
			maxChipCount: null;
	  };

interface RequestState {
	resultName: string;
	status: ChipHeatMapCountsState["status"];
	rawCounts: ChipHeatMapCount[];
}

const EMPTY_COUNTS = new Map<string, number>();

export const useChipHeatMapCounts = (
	enabled: boolean,
): ChipHeatMapCountsState => {
	const { resultName } = useResultName();
	const { idw, toDrawChipIndex } = useIdw();
	const requestIdRef = useRef(0);
	const activeControllerRef = useRef<AbortController | null>(null);
	const requestStateRef = useRef<RequestState>({
		resultName,
		status: "idle",
		rawCounts: [],
	});
	const [requestState, setRequestState] = useState(requestStateRef.current);

	useEffect(() => {
		const currentState = requestStateRef.current;
		if (currentState.resultName !== resultName) {
			requestIdRef.current += 1;
			activeControllerRef.current?.abort();
			activeControllerRef.current = null;
			const nextState: RequestState = {
				resultName,
				status: "idle",
				rawCounts: [],
			};
			requestStateRef.current = nextState;
			setRequestState(nextState);
			return;
		}

		if (
			!enabled ||
			resultName === "" ||
			currentState.status === "loading" ||
			currentState.status === "success"
		) {
			return;
		}

		const requestId = ++requestIdRef.current;
		const controller = new AbortController();
		activeControllerRef.current = controller;
		const loadingState: RequestState = {
			resultName,
			status: "loading",
			rawCounts: [],
		};
		requestStateRef.current = loadingState;
		setRequestState(loadingState);

		void getChipHeatMapCounts(resultName, controller.signal)
			.then((rawCounts) => {
				if (requestId !== requestIdRef.current) return;
				const successState: RequestState = {
					resultName,
					status: "success",
					rawCounts,
				};
				requestStateRef.current = successState;
				setRequestState(successState);
			})
			.catch((error: unknown) => {
				if (requestId !== requestIdRef.current) return;
				if (error instanceof Error && error.name === "AbortError") return;
				const errorState: RequestState = {
					resultName,
					status: "error",
					rawCounts: [],
				};
				requestStateRef.current = errorState;
				setRequestState(errorState);
			})
			.finally(() => {
				if (requestId === requestIdRef.current) {
					activeControllerRef.current = null;
				}
			});
	}, [enabled, resultName]);

	useEffect(
		() => () => {
			requestIdRef.current += 1;
			activeControllerRef.current?.abort();
			activeControllerRef.current = null;
		},
		[],
	);

	const counts = useMemo(() => {
		if (requestState.status !== "success" || idw == null) return EMPTY_COUNTS;
		const nextCounts = new Map<string, number>();
		for (const item of requestState.rawCounts) {
			const drawIndex = toDrawChipIndex(new Point(item.chipX, item.chipY));
			nextCounts.set(`${drawIndex.x},${drawIndex.y}`, item.count);
		}
		return nextCounts;
	}, [idw, requestState, toDrawChipIndex]);
	if (requestState.resultName !== resultName) {
		return {
			status: "idle",
			counts: EMPTY_COUNTS,
			isReady: false,
			maxChipCount: null,
		};
	}
	if (requestState.status === "success") {
		return {
			status: "success",
			counts,
			isReady: idw != null,
			maxChipCount: requestState.rawCounts.reduce(
				(maxCount, item) => Math.max(maxCount, item.count),
				0,
			),
		};
	}
	return {
		status: requestState.status,
		counts: EMPTY_COUNTS,
		isReady: false,
		maxChipCount: null,
	};
};
