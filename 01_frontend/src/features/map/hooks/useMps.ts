import { useEffect, useState } from "react";

import { useResultName } from "~/features/misc/hooks/useResultName";
import type { Area } from "~/features/recipe/types";
import { useFovList } from "~/features/s-fov-list/hooks/useFovList";

import { getMps } from "../api/getMps";

interface UseMps {
	mps: Area | undefined;
}

export const useMps = (): UseMps => {
	const [mps, setMps] = useState<Area | undefined>(undefined);
	const { resultName } = useResultName();
	const { selectedFov } = useFovList();

	useEffect(() => {
		if (resultName.length === 0) return;

		const controller = new AbortController();
		getMps(resultName, controller.signal)
			.then((res) => {
				setMps(
					res.find((value) => {
						return value.areaNo === (selectedFov?.areano ?? 1);
					}),
				);
			})
			.catch((error) => {
				if (error.name === "AbortError") return;
				console.error("getMFov fetch fail.", error);
			});
		return () => {
			controller.abort();
		};
	}, [resultName, selectedFov?.areano]);

	return { mps };
};
