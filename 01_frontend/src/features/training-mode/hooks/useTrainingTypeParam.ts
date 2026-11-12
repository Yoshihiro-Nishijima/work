import { atom, useAtom } from "jotai";
import type { Dispatch, SetStateAction } from "react";

import type { TrainingType } from "../type";

const TrainingTypeAtom = atom<TrainingType>("D2D");

interface UseTrainingTypeParam {
	trainingType: TrainingType;
	setTrainingType: Dispatch<SetStateAction<TrainingType>>;
}

export const useTrainingTypeParam = (): UseTrainingTypeParam => {
	const [trainingType, setTrainingType] = useAtom(TrainingTypeAtom);

	return {
		trainingType,
		setTrainingType,
	};
};
