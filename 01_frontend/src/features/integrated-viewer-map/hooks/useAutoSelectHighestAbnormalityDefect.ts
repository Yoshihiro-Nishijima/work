import { useAtomValue } from "jotai";
import { useCallback, useEffect, useRef } from "react";

import { getDefect } from "~/features/defect-list/api/getDefect";
import {
	buildDefectQuery,
	filterAtom,
	type MapChipFilter,
} from "~/features/defect-list/hooks/useDefect";
import type { Sort } from "~/features/job-manager-info/types";
import { useResultName } from "~/features/misc/hooks/useResultName";
import { useSelectedDefect } from "~/features/misc/hooks/useSelectedDefect";

const HIGHEST_ABNORMALITY_SORT: Sort[] = [
	{ field: "abnormality", direction: "desc" },
	{ field: "defectId", direction: "asc" },
];

interface UseAutoSelectHighestAbnormalityDefect {
	selectHighestAbnormalityDefect: (
		region: MapChipFilter,
		defectClass?: number,
	) => Promise<void>;
}

export const useAutoSelectHighestAbnormalityDefect = (): UseAutoSelectHighestAbnormalityDefect => {
	const filter = useAtomValue(filterAtom);
	const { resultName } = useResultName();
	const { setSelectedDefect } = useSelectedDefect();
	const requestIdRef = useRef(0);
	const activeControllerRef = useRef<AbortController | null>(null);

	const selectHighestAbnormalityDefect = useCallback(
		async (region: MapChipFilter, defectClass?: number): Promise<void> => {
			if (resultName.length === 0) return;

			const requestId = ++requestIdRef.current;
			activeControllerRef.current?.abort();
			const controller = new AbortController();
			activeControllerRef.current = controller;

			const query = buildDefectQuery({
				pagination: { page: 0, pageSize: 1 },
				sort: HIGHEST_ABNORMALITY_SORT,
				filter,
				mapChipFilter: region,
				defectClass,
			});
			try {
				const response = await getDefect(
					resultName,
					query,
					controller.signal,
				);
				if (requestId !== requestIdRef.current) return;

				const highestDefect = response.defects[0];
				setSelectedDefect((currentDefect) => {
					if (highestDefect == null) return undefined;
					if (currentDefect?.defectId === highestDefect.defectId)
						return currentDefect;
					return highestDefect;
				});
			} catch (error) {
				if (requestId !== requestIdRef.current) return;
				if (error.name !== "AbortError")
					console.error("getDefect fetch fail.", error);
			} finally {
				if (requestId === requestIdRef.current) {
					activeControllerRef.current = null;
				}
			}
		},
		[filter, resultName, setSelectedDefect],
	);

	useEffect(() => {
		return () => {
			requestIdRef.current += 1;
			activeControllerRef.current?.abort();
			activeControllerRef.current = null;
		};
	}, [filter, resultName]);

	return { selectHighestAbnormalityDefect };
};
