import { useAtomValue } from "jotai";
import { useEffect, useRef, useState } from "react";

import {
	getDefectClassCounts,
	type DefectClassCount,
	type DefectClassCountsQuery,
} from "~/features/defect-list/api/getDefectClassCounts";
import { convertDefectFilter, filterAtom } from "~/features/defect-list/hooks/useDefect";
import type { MapChipFilter } from "~/features/defect-list/hooks/useDefect";
import type { Filter } from "~/features/job-manager-info/types";
import { useResultName } from "~/features/misc/hooks/useResultName";

export type HoverDefectClassCountsState =
	| { status: "idle"; counts: [] }
	| { status: "loading"; counts: [] }
	| { status: "success"; counts: DefectClassCount[] }
	| { status: "error"; counts: [] };

const EMPTY_COUNTS_STATE: HoverDefectClassCountsState = {
	status: "idle",
	counts: [],
};

interface RequestState {
	key: string;
	value: HoverDefectClassCountsState;
}

const getRegionKey = (region: MapChipFilter | null): string => {
	if (region == null) return "";
	return JSON.stringify([
		region.chipX,
		region.chipY,
		region.mFOVno ?? null,
		region.sFOVno ?? null,
	]);
};

export const useHoverDefectClassCounts = (
	region: MapChipFilter | null,
): HoverDefectClassCountsState => {
	const filterModel = useAtomValue(filterAtom);
	const { resultName } = useResultName();
	const filterKey = JSON.stringify(convertDefectFilter(filterModel)) ?? "";
	const regionKey = getRegionKey(region);
	const canRequest = regionKey !== "" && resultName.length > 0;
	const requestKey = canRequest
		? JSON.stringify([resultName, regionKey, filterKey])
		: "";
	const requestIdRef = useRef(0);
	const activeControllerRef = useRef<AbortController | null>(null);
	const [requestState, setRequestState] = useState<RequestState>({
		key: "",
		value: EMPTY_COUNTS_STATE,
	});

	useEffect(() => {
		const requestId = ++requestIdRef.current;
		activeControllerRef.current?.abort();
		activeControllerRef.current = null;

		if (!canRequest) {
			setRequestState({ key: "", value: EMPTY_COUNTS_STATE });
			return;
		}

		const [chipX, chipY, mFOVno, sFOVno] = JSON.parse(regionKey) as [
			number,
			number,
			number | null,
			number | null,
		];
		const query: DefectClassCountsQuery = {
			resultName,
			chipX,
			chipY,
			...(mFOVno == null ? {} : { mFOVno }),
			...(sFOVno == null ? {} : { sFOVno }),
			...(filterKey === "" ? {} : { filter: JSON.parse(filterKey) as Filter }),
		};
		const controller = new AbortController();
		activeControllerRef.current = controller;
		setRequestState({
			key: requestKey,
			value: { status: "loading", counts: [] },
		});

		void getDefectClassCounts(query, controller.signal)
			.then((counts) => {
				if (requestId !== requestIdRef.current) return;
				setRequestState({
					key: requestKey,
					value: { status: "success", counts },
				});
			})
			.catch((error: unknown) => {
				if (requestId !== requestIdRef.current) return;
				if (error instanceof Error && error.name === "AbortError") return;
				setRequestState({
					key: requestKey,
					value: { status: "error", counts: [] },
				});
			})
			.finally(() => {
				if (requestId === requestIdRef.current) {
					activeControllerRef.current = null;
				}
			});

		return () => {
			controller.abort();
			if (requestId === requestIdRef.current) {
				requestIdRef.current += 1;
			}
			if (activeControllerRef.current === controller) {
				activeControllerRef.current = null;
			}
		};
	}, [canRequest, filterKey, regionKey, requestKey, resultName]);

	if (!canRequest) return EMPTY_COUNTS_STATE;
	if (requestState.key !== requestKey) {
		return { status: "loading", counts: [] };
	}
	return requestState.value;
};
