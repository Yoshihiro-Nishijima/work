import type { GridFilterItem } from "@mui/x-data-grid-pro";
import { atom, useAtom } from "jotai";
import { useCallback, useMemo } from "react";

import { useResultName } from "~/features/misc/hooks/useResultName";

import type {
	DefectHistogramField,
	DefectHistogramItemState,
	DefectHistogramRangeRequest,
} from "../types";
import { defectHistogramQueryService } from "./defectHistogramQueryService";

const itemsAtom = atom<DefectHistogramItemState[]>([]);
let nextHistogramId = 0;

const initialItem = (
	histogramId: string,
	field: DefectHistogramField,
	filter?: GridFilterItem,
): DefectHistogramItemState => ({
	histogramId,
	field,
	filter,
	status: "loading",
	rangeStatus: "idle",
	result: null,
	range: null,
	rangeResult: null,
	error: null,
	rangeError: null,
	logYAxis: false,
});

const snapshotFilter = (filter?: GridFilterItem): GridFilterItem | undefined =>
	filter == null
		? undefined
		: {
				field: filter.field,
				operator: filter.operator,
				value: filter.value,
			};

const errorMessage = (error: unknown): string =>
	error instanceof Error ? error.message : "ヒストグラムの取得に失敗しました";

export const useDefectHistogram = () => {
	const [items, setItems] = useAtom(itemsAtom);
	const { resultName } = useResultName();

	const updateItem = useCallback(
		(
			id: string,
			update: (item: DefectHistogramItemState) => DefectHistogramItemState,
		) => {
			setItems((current) =>
				current.map((item) => (item.histogramId === id ? update(item) : item)),
			);
		},
		[setItems],
	);

	const fetchHistogram = useCallback(
		async (
			id: string,
			field: DefectHistogramField,
			filter?: GridFilterItem,
		) => {
			updateItem(id, (item) => ({ ...item, status: "loading", error: null }));
			try {
				const result = await defectHistogramQueryService.getHistogram(
					id,
					resultName,
					{ field, filter },
				);
				updateItem(id, (item) => ({
					...item,
					status: "success",
					result,
					range:
						result.dataMin == null || result.dataMax == null
							? null
							: [result.dataMin, result.dataMax],
					rangeResult: null,
					rangeStatus: "idle",
					rangeError: null,
				}));
			} catch (error) {
				updateItem(id, (item) => ({
					...item,
					status: "error",
					error: errorMessage(error),
				}));
			}
		},
		[resultName, updateItem],
	);

	const addHistogram = useCallback(
		(field: DefectHistogramField, filter?: GridFilterItem) => {
			const id = `defect-histogram-${++nextHistogramId}`;
			const filterSnapshot = snapshotFilter(filter);
			setItems((current) => [
				initialItem(id, field, filterSnapshot),
				...current,
			]);
			void fetchHistogram(id, field, filterSnapshot);
		},
		[fetchHistogram, setItems],
	);

	const createRangeRequest = useCallback(
		(
			item: DefectHistogramItemState,
			range: [number, number],
		): DefectHistogramRangeRequest => ({
			field: item.field,
			filter: item.filter,
			lower: range[0],
			upper: range[1],
		}),
		[],
	);

	const runRangeRequest = useCallback(
		async (
			item: DefectHistogramItemState,
			request: DefectHistogramRangeRequest,
			generation: number,
		) => {
			if (
				!defectHistogramQueryService.isLatestRange(
					item.histogramId,
					request,
					generation,
				)
			) {
				return;
			}
			updateItem(item.histogramId, (current) => ({
				...current,
				rangeStatus: "loading",
				rangeError: null,
			}));
			try {
				const rangeResult = await defectHistogramQueryService.getRange(
					item.histogramId,
					resultName,
					request,
					generation,
				);
				if (rangeResult != null) {
					updateItem(item.histogramId, (current) => ({
						...current,
						rangeStatus: "success",
						rangeResult,
					}));
				}
			} catch (error) {
				if (
					defectHistogramQueryService.isLatestRange(
						item.histogramId,
						request,
						generation,
					)
				) {
					updateItem(item.histogramId, (current) => ({
						...current,
						rangeStatus: "error",
						rangeError: errorMessage(error),
					}));
				}
			}
		},
		[resultName, updateItem],
	);

	const scheduleRange = useCallback(
		(item: DefectHistogramItemState, range: [number, number]) => {
			const request = createRangeRequest(item, range);
			const generation = defectHistogramQueryService.prepareRange(
				item.histogramId,
				request,
			);
			updateItem(item.histogramId, (current) => ({
				...current,
				range,
				rangeStatus: "idle",
				rangeResult: null,
				rangeError: null,
			}));
			defectHistogramQueryService.scheduleRange(item.histogramId, () => {
				void runRangeRequest(item, request, generation);
			});
		},
		[createRangeRequest, runRangeRequest, updateItem],
	);

	const fetchRange = useCallback(
		(item: DefectHistogramItemState, range: [number, number]) => {
			defectHistogramQueryService.cancelScheduledRange(item.histogramId);
			const request = createRangeRequest(item, range);
			const generation = defectHistogramQueryService.prepareRange(
				item.histogramId,
				request,
			);
			updateItem(item.histogramId, (current) => ({
				...current,
				range,
				rangeStatus: "loading",
				rangeError: null,
			}));
			void runRangeRequest(item, request, generation);
		},
		[createRangeRequest, runRangeRequest, updateItem],
	);

	const removeHistogram = useCallback(
		(id: string) => {
			defectHistogramQueryService.cancelItem(id);
			setItems((current) => current.filter((item) => item.histogramId !== id));
		},
		[setItems],
	);

	const resetRange = useCallback(
		(item: DefectHistogramItemState) => {
			if (item.result?.dataMin == null || item.result.dataMax == null) return;
			fetchRange(item, [item.result.dataMin, item.result.dataMax]);
		},
		[fetchRange],
	);

	const resetAllRanges = useCallback(() => {
		for (const item of items) resetRange(item);
	}, [items, resetRange]);

	const setLogYAxis = useCallback(
		(id: string, value: boolean) => {
			updateItem(id, (item) => ({ ...item, logYAxis: value }));
		},
		[updateItem],
	);

	return useMemo(
		() => ({
			items,
			addHistogram,
			removeHistogram,
			scheduleRange,
			fetchRange,
			resetRange,
			resetAllRanges,
			setLogYAxis,
		}),
		[
			addHistogram,
			fetchRange,
			items,
			removeHistogram,
			resetAllRanges,
			resetRange,
			scheduleRange,
			setLogYAxis,
		],
	);
};

export const useDefectHistogramPanel = (): { visible: boolean } => {
	const [items] = useAtom(itemsAtom);
	return { visible: items.length > 0 };
};
