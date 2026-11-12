import { useEffect, useState } from "react";

import { getFov } from "~/features/s-fov-list/api/getFov";
import type { Fov } from "~/features/s-fov-list/types";
import {
	getChipHeatMapCounts,
	type ChipHeatMapCount,
} from "~/features/integrated-viewer-map/api/getChipHeatMapCounts";
import { getMps } from "~/features/map/api/getMps";
import { getResults } from "~/features/job-manager-info/api/getResults";
import type { Filter, Result, SearchParam } from "~/features/job-manager-info/types";
import { getResultsRecord } from "~/features/misc/api/getResultsRecord";
import { useResultName } from "~/features/misc/hooks/useResultName";
import { useSelectedDefect } from "~/features/misc/hooks/useSelectedDefect";
import { toPagingQueryParam } from "~/features/misc/types/pagingQueryParam";
import type { ResultsRecord } from "~/features/misc/types";
import { getFovInfo } from "~/features/recipe/api/getFovInfo";
import type { Area } from "~/features/recipe/types";
import type { modeFov } from "~/features/recipe/types/modeFov";
import { useFovList } from "~/features/s-fov-list/hooks/useFovList";
import { toTimeStr } from "~/utils/formatter";

type AsyncValue<T> =
	| { key: string; status: "idle" | "loading" | "error" }
	| { key: string; status: "success"; value: T };

export interface InspectionInfoValues {
	recipeName: string;
	lotId: string;
	waferId: string;
	carrierId: string;
	slotNo: string;
	scanMode: string;
	pixelSize: string;
	clock: string;
	frame: string;
	inspectionDieCount: string;
	jobType: string;
	processTime: string;
	defectCount: string;
	defectDieCount: string;
	defectDensity: string;
	inspectionArea: string;
	throughput: string;
}

const emptyValues: InspectionInfoValues = {
	recipeName: "",
	lotId: "",
	waferId: "",
	carrierId: "",
	slotNo: "",
	scanMode: "",
	pixelSize: "",
	clock: "",
	frame: "",
	inspectionDieCount: "",
	jobType: "",
	processTime: "",
	defectCount: "",
	defectDieCount: "",
	defectDensity: "",
	inspectionArea: "",
	throughput: "",
};

const displayValue = (value: string | number | null | undefined): string =>
	value == null ? "" : String(value);

const decimalPlaces = (value: number): number => {
	const [coefficient, exponent = "0"] = value.toString().toLowerCase().split("e");
	const fractionDigits = coefficient.split(".")[1]?.length ?? 0;
	return Math.max(0, fractionDigits - Number(exponent));
};

const formatInspectionArea = (fovWidth: number, fovHeight: number): string => {
	const area = fovWidth * fovHeight;
	if (!Number.isFinite(area)) return "";

	const precision = decimalPlaces(fovWidth) + decimalPlaces(fovHeight);
	return precision <= 100 ? String(Number(area.toFixed(precision))) : String(area);
};

export const useInspectionInfo = (): { values: InspectionInfoValues } => {
	const { resultName } = useResultName();
	const { selectedFov } = useFovList();
	const { selectedDefect } = useSelectedDefect();
	const [resultState, setResultState] = useState<AsyncValue<Result>>({
		key: "",
		status: "idle",
	});
	const [recordState, setRecordState] =
		useState<AsyncValue<ResultsRecord>>({ key: "", status: "idle" });
	const [areasState, setAreasState] = useState<AsyncValue<Area[]>>({
		key: "",
		status: "idle",
	});
	const [chipDefectCountsState, setChipDefectCountsState] = useState<
		AsyncValue<ChipHeatMapCount[]>
	>({ key: "", status: "idle" });
	const [fallbackFovState, setFallbackFovState] = useState<AsyncValue<Fov>>({
		key: "",
		status: "idle",
	});
	const fovKey = selectedFov
		? `${resultName}\u0000${selectedFov.mfovno}\u0000${selectedFov.sfovno}`
		: "";
	const defectMFovNo = selectedDefect?.mFOVno;
	const defectSFovNo = selectedDefect?.sFOVno;
	const fallbackFovKey =
		!selectedFov && resultName && defectMFovNo != null && defectSFovNo != null
			? `${resultName}\u0000${defectMFovNo}\u0000${defectSFovNo}`
			: "";
	const mFovNo = selectedFov?.mfovno;
	const sFovNo = selectedFov?.sfovno;
	const [fovState, setFovState] = useState<AsyncValue<modeFov>>({
		key: "",
		status: "idle",
	});

	useEffect(() => {
		if (!resultName) {
			setResultState({ key: "", status: "idle" });
			setRecordState({ key: "", status: "idle" });
			setAreasState({ key: "", status: "idle" });
			return;
		}

		const controller = new AbortController();
		setResultState({ key: resultName, status: "loading" });
		setRecordState({ key: resultName, status: "loading" });
		setAreasState({ key: resultName, status: "loading" });

		const param: SearchParam = {
			start: 0,
			limit: 1,
			filter: { items: [{ field: "name", operator: "=", value: resultName }] },
		};
		void getResults(param, controller.signal)
			.then(({ results }) => {
				if (controller.signal.aborted) return;
				const result = results.find((item) => item.name === resultName);
				setResultState(
					result
						? { key: resultName, status: "success", value: result }
						: { key: resultName, status: "error" },
				);
			})
			.catch(() => {
				if (!controller.signal.aborted)
					setResultState({ key: resultName, status: "error" });
			});
		void getResultsRecord(resultName, controller.signal)
			.then((value) => {
				if (!controller.signal.aborted)
					setRecordState({ key: resultName, status: "success", value });
			})
			.catch(() => {
				if (!controller.signal.aborted)
					setRecordState({ key: resultName, status: "error" });
			});
		void getMps(resultName, controller.signal)
			.then((value) => {
				if (!controller.signal.aborted)
					setAreasState({ key: resultName, status: "success", value });
			})
			.catch(() => {
				if (!controller.signal.aborted)
					setAreasState({ key: resultName, status: "error" });
			});

		return () => controller.abort();
	}, [resultName]);

	useEffect(() => {
		if (!resultName) {
			setChipDefectCountsState({ key: "", status: "idle" });
			return;
		}

		const controller = new AbortController();
		setChipDefectCountsState({ key: resultName, status: "loading" });
		void getChipHeatMapCounts(resultName, controller.signal)
			.then((value) => {
				if (controller.signal.aborted) return;
				setChipDefectCountsState({
					key: resultName,
					status: "success",
					value,
				});
			})
			.catch(() => {
				if (!controller.signal.aborted)
					setChipDefectCountsState({ key: resultName, status: "error" });
			});

		return () => controller.abort();
	}, [resultName]);

	useEffect(() => {
		if (
			!fallbackFovKey ||
			defectMFovNo == null ||
			defectSFovNo == null
		) {
			setFallbackFovState({ key: "", status: "idle" });
			return;
		}

		const controller = new AbortController();
		const filter: Filter = {
			items: [
				{ field: "mfovno", operator: "=", value: defectMFovNo },
				{ field: "sfovno", operator: "=", value: defectSFovNo },
			],
			logicOperator: "and",
		};
		const query = toPagingQueryParam(undefined, [], filter);
		setFallbackFovState({ key: fallbackFovKey, status: "loading" });
		void getFov(resultName, query, controller.signal)
			.then(({ fovs }) => {
				if (controller.signal.aborted) return;
				const matchedFov = fovs.find(
					(fov) =>
						fov.mfovno === defectMFovNo && fov.sfovno === defectSFovNo,
				);
				setFallbackFovState(
					matchedFov
						? {
								key: fallbackFovKey,
								status: "success",
								value: matchedFov,
							}
						: { key: fallbackFovKey, status: "error" },
				);
			})
			.catch(() => {
				if (!controller.signal.aborted)
					setFallbackFovState({ key: fallbackFovKey, status: "error" });
			});

		return () => controller.abort();
	}, [
		defectMFovNo,
		defectSFovNo,
		fallbackFovKey,
		resultName,
	]);

	useEffect(() => {
		if (!resultName || mFovNo == null || sFovNo == null || !fovKey) {
			setFovState({ key: "", status: "idle" });
			return;
		}

		const controller = new AbortController();
		setFovState({ key: fovKey, status: "loading" });
		void getFovInfo(
			{
				resultName,
				mFovNo,
				sFovNo,
			},
			controller.signal,
		)
			.then((value) => {
				if (!controller.signal.aborted)
					setFovState({ key: fovKey, status: "success", value });
			})
			.catch(() => {
				if (!controller.signal.aborted)
					setFovState({ key: fovKey, status: "error" });
			});

		return () => controller.abort();
	}, [fovKey, mFovNo, resultName, sFovNo]);

	const result =
		resultState.key === resultName && resultState.status === "success"
			? resultState.value
			: undefined;
	const record =
		recordState.key === resultName && recordState.status === "success"
			? recordState.value
			: undefined;
	const areaList =
		areasState.key === resultName && areasState.status === "success"
			? areasState.value
			: undefined;
	const chipDefectCounts =
		chipDefectCountsState.key === resultName &&
		chipDefectCountsState.status === "success"
			? chipDefectCountsState.value
			: undefined;
	const fov =
		fovState.key === fovKey && fovState.status === "success"
			? fovState.value
			: undefined;
	const fallbackFov =
		fallbackFovState.key === fallbackFovKey &&
		fallbackFovState.status === "success"
			? fallbackFovState.value
			: undefined;
	const areaNo =
		selectedFov != null ? selectedFov.areano : fallbackFov?.areano;
	const area = areaList?.find((item) => item.areaNo === areaNo);

	return {
		values: {
			...emptyValues,
			recipeName: displayValue(result?.recipe),
			lotId: displayValue(result?.lotID),
			waferId: displayValue(record?.waferId),
			slotNo: displayValue(result?.slotNo),
			scanMode: displayValue(fov?.scanMode),
			pixelSize: displayValue(fov?.pixelSize),
			frame: displayValue(fov?.frame),
			inspectionDieCount: displayValue(chipDefectCounts?.length),
			jobType: displayValue(result?.jobType),
			processTime: result ? toTimeStr(result.processTime) : "",
			defectCount: displayValue(record?.defectCount),
			defectDieCount: displayValue(
				chipDefectCounts?.filter(({ count }) => count > 0).length,
			),
			defectDensity: displayValue(record?.defectDensity),
			inspectionArea:
				area == null
					? ""
					: formatInspectionArea(area.fovWidth, area.fovHeight),
		},
	};
};