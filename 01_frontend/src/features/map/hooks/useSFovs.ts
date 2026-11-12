import { atom, useAtom } from "jotai";
import { useEffect } from "react";

import { useResultName } from "~/features/misc/hooks/useResultName";

import { getSFovs } from "../api/getSFovs";
import type { SFov } from "../types";

const sFovListAtom = atom<SFov[] | undefined>(undefined);

interface UseSFovs {
	sFovList: SFov[] | undefined;
}

export const useSFovs = (): UseSFovs => {
	const [sFovList, setSFovList] = useAtom(sFovListAtom);
	const { resultName } = useResultName();

	useEffect(() => {
		if (resultName.length === 0) return;

		const controller = new AbortController();
		getSFovs(resultName, controller.signal)
			.then((res) => {
				setSFovList(res);
			})
			.catch((error) => {
				if (error.name === "AbortError") return;
				console.error("getMFov fetch fail.", error);
			});
		return () => {
			controller.abort();
		};
	}, [resultName, setSFovList]);

	return { sFovList };
};
