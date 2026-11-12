import { useCallback, useEffect, useState } from "react";

import { ky } from "~/lib/ky";

export interface UseADCModels {
	adcModels: string[];
	fetchAdcModels: () => Promise<string[]>;
}
export const useADCModels = (): UseADCModels => {
	const [adcModels, setAdcModels] = useState<string[]>([]);

	const fetchAdcModels = useCallback(async (): Promise<string[]> => {
		try {
			const controller = new AbortController();
			const models = await ky
				.get("models/adc", { signal: controller.signal })
				.json<string[]>();
			setAdcModels(models);
			return models;
		} catch (error) {
			console.error("fetchADCModelsOnly failed", error);
			setAdcModels([]);
			return [];
		}
	}, []);

	useEffect(() => {
		void fetchAdcModels();
	}, [fetchAdcModels]);

	return { adcModels, fetchAdcModels };
};
