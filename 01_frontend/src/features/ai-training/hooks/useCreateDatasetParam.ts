import { atom, useAtom } from "jotai";
import { atomWithReset, useResetAtom } from "jotai/utils";
import type { Dispatch, SetStateAction } from "react";
import type { Source } from "../types";

const datasetTypeAtom = atomWithReset("ADC");
const datasetNameAtom = atomWithReset("");
const sourceListAtom = atom<Source[]>([]);

export interface UseCreateDatasetParam {
	datasetType: string;
	setDatasetType: Dispatch<SetStateAction<string>>;
	resetDatasetType: () => void;
	datasetName: string;
	setDatasetName: Dispatch<SetStateAction<string>>;
	resetDatasetName: () => void;
	sourceList: Source[];
	setSourceList: Dispatch<SetStateAction<Source[]>>;
}

export const useCreateDatasetParam = (): UseCreateDatasetParam => {
	const [datasetType, setDatasetType] = useAtom(datasetTypeAtom);
	const resetDatasetType = useResetAtom(datasetTypeAtom);
	const [datasetName, setDatasetName] = useAtom(datasetNameAtom);
	const resetDatasetName = useResetAtom(datasetNameAtom);
	const [sourceList, setSourceList] = useAtom(sourceListAtom);
	return {
		datasetType,
		setDatasetType,
		resetDatasetType,
		datasetName,
		setDatasetName,
		resetDatasetName,
		sourceList,
		setSourceList,
	};
};
