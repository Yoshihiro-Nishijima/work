import { atom, useAtom } from "jotai";
import type { Dispatch, SetStateAction } from "react";

interface UseDataset {
	datasetType: string;
	setDatasetType: Dispatch<SetStateAction<string>>;
	datasetName: string;
	setDatasetName: Dispatch<SetStateAction<string>>;
}

const datasetTypeAtom = atom("");
const datasetNameAtom = atom("");

export const useDataset = (): UseDataset => {
	const [datasetType, setDatasetType] = useAtom(datasetTypeAtom);
	const [datasetName, setDatasetName] = useAtom(datasetNameAtom);
	return { datasetType, setDatasetType, datasetName, setDatasetName };
};
