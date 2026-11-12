import { atom, useAtom } from "jotai";
import type { Dispatch, SetStateAction } from "react";

import type { TrainableModelData } from "~/features/job-manager-info/types";

const selectedModelAtom = atom<TrainableModelData | undefined>(undefined);

interface UseSelectedModel {
	selectedModel: TrainableModelData | undefined;
	setSelectedModel: Dispatch<SetStateAction<TrainableModelData | undefined>>;
}

export const useSelectedModel = (): UseSelectedModel => {
	const [selectedModel, setSelectedModel] = useAtom(selectedModelAtom);
	return { selectedModel, setSelectedModel };
};
