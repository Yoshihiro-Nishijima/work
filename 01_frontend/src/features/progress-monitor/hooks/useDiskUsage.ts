import { useCallback, useEffect } from "react";

import { DISK_AVAILABLE_SHOW_INTERVAL } from "~/config";

import { atom, useAtomValue } from "jotai";
import { useAtomCallback } from "jotai/utils";
import { getDiskUsage } from "../api/getDiskUsage";
import type { DiskUsage, DiskUsageData } from "../types";

const defaultDiskUsage: DiskUsage = {
	available: "-",
	use: "0%",
	usePer: 0,
};
const defaultDiskUsageData: DiskUsageData = {
	toolData: defaultDiskUsage,
	result: defaultDiskUsage,
};
const usageAtom = atom(defaultDiskUsageData);

const isSameUsage = (a: DiskUsageData, b: DiskUsageData): boolean => {
	const eq = (x?: typeof a.result, y?: typeof b.result) =>
		!!x &&
		!!y &&
		x.available === y.available &&
		x.use === y.use &&
		x.usePer === y.usePer;
	const resultEq = eq(a.result, b.result);
	const toolDataEq =
		!!a.toolData === !!b.toolData &&
		(!a.toolData || (b.toolData ? eq(a.toolData, b.toolData) : false));
	return resultEq && toolDataEq;
};

export const useDiskUsage = (): { usage: DiskUsageData } => {
	const usage = useAtomValue(usageAtom);

	const refreshDiskUsage = useAtomCallback(
		useCallback((get, set) => {
			const controller = new AbortController();
			getDiskUsage(controller.signal)
				.then((res) => {
					res.result.usePer = Number.parseInt(res.result.use);
					if (res.toolData) {
						res.toolData.usePer = Number.parseInt(res.toolData.use);
					}
					const prev = get(usageAtom);
					if (isSameUsage(prev, res)) return;
					set(usageAtom, res);
				})
				.catch((error) => {
					if (error.name === "AbortError") return;
					console.error("getDiskUsage fetch fail.", error);
				});
			setTimeout(refreshDiskUsage, DISK_AVAILABLE_SHOW_INTERVAL);
			return () => {
				controller.abort();
			};
		}, []),
	);

	// 定期的にusageを更新
	useEffect(() => {
		// 最初の１回は即実行
		setTimeout(refreshDiskUsage, 0);
	}, [refreshDiskUsage]);

	return { usage };
};
