import { atom, useAtom } from "jotai";
import type { Dispatch, SetStateAction } from "react";

const modelNameAtom = atom("");
const isValidModelNameAtom = atom(false);
const baseModelNameAtom = atom("");

export interface UseModelNameParam {
	modelName: string;
	setModelName: Dispatch<SetStateAction<string>>;
	isValidModelName: boolean;
	setIsValidModelName: Dispatch<SetStateAction<boolean>>;
	baseModelName: string;
	setBaseModelName: Dispatch<SetStateAction<string>>;
}

export const useModelNameParam = (): UseModelNameParam => {
	const [modelName, setModelName] = useAtom(modelNameAtom);
	const [isValidModelName, setIsValidModelName] = useAtom(isValidModelNameAtom);
	const [baseModelName, setBaseModelName] = useAtom(baseModelNameAtom);

	return {
		modelName,
		setModelName,
		isValidModelName,
		setIsValidModelName,
		baseModelName,
		setBaseModelName,
	};
};
