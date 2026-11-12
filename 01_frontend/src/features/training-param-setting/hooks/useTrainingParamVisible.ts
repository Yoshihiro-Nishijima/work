import { atom, useAtom } from "jotai";
import type { Dispatch, SetStateAction } from "react";

const trainingParamVisibleAtom = atom(false);

interface UseTrainingParamVisible {
	trainingParamVisible: boolean;
	setTrainingParamVisible: Dispatch<SetStateAction<boolean>>;
}

export const useTrainingParamVisible = (): UseTrainingParamVisible => {
	const [trainingParamVisible, setTrainingParamVisible] = useAtom(
		trainingParamVisibleAtom,
	);
	return { trainingParamVisible, setTrainingParamVisible };
};
