import { atom, useAtom } from "jotai";
import type { Dispatch, SetStateAction } from "react";

/* SegmentationのModelName */
const modelAtom = atom("");

export interface UseModel {
	model: string;
	setModel: Dispatch<SetStateAction<string>>;
}
export const useModel = (): UseModel => {
	const [model, setModel] = useAtom(modelAtom);
	return { model, setModel };
};
