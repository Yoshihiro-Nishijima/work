import { useCallback, useEffect, useState } from "react";

import type { JobType } from "~/features/recipe/types";

import { getModels } from "../api/getModels";

const EMPTY: string[] = [];

export interface UseModels {
	models: string[];
	fetchModels: () => Promise<string[]>;
}

export const useModels = (jobType: JobType): UseModels => {
	const [models, setModels] = useState(EMPTY);

	const fetchModels = useCallback(async (): Promise<string[]> => {
		switch (jobType) {
			case "Matching":
			case "Camera":
			case "C2C":
			case "D2D":
				setModels(EMPTY);
				return EMPTY;
		}
		try {
			const controller = new AbortController();
			const res = await getModels(jobType, controller.signal);
			setModels(res);
			return res;
		} catch (error) {
			setModels(EMPTY);
			console.error("fetchModels failed.", error);
			return EMPTY;
		}
	}, [jobType]);

	useEffect(() => {
		void fetchModels();
	}, [fetchModels]);

	return { models, fetchModels };
};
