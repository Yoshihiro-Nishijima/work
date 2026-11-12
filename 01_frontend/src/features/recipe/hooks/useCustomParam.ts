import { atom, useAtom, useAtomValue } from "jotai";
import type { Dispatch, SetStateAction } from "react";

import type { CategoryType, Design, ToneType } from "../types";

const categoryAtom = atom<CategoryType | undefined>(undefined);
const toneAtom = atom<ToneType | undefined>(undefined);
const sizeXAtom = atom<number | undefined>(undefined);
const sizeYAtom = atom<number | undefined>(undefined);
const pitchXAtom = atom<number | undefined>(undefined);
const pitchYAtom = atom<number | undefined>(undefined);
const shiftXAtom = atom<number | undefined>(undefined);
const shiftYAtom = atom<number | undefined>(undefined);

// Custom Param Layout Setting 判定用 selector
const enableLayoutXSelector = atom((get) => get(categoryAtom) !== "H-Line");
const enableLayoutYSelector = atom((get) => get(categoryAtom) !== "V-Line");

export interface UseCustomParam {
	category?: CategoryType;
	tone?: ToneType;
	sizeX?: number;
	sizeY?: number;
	pitchX: number | undefined;
	pitchY: number | undefined;
	shiftX: number | undefined;
	shiftY: number | undefined;
	enableLayoutX: boolean;
	enableLayoutY: boolean;
	setCategory: Dispatch<SetStateAction<CategoryType | undefined>>;
	setTone: Dispatch<SetStateAction<ToneType | undefined>>;
	setSizeX: Dispatch<SetStateAction<number | undefined>>;
	setSizeY: Dispatch<SetStateAction<number | undefined>>;
	setPitchX: Dispatch<SetStateAction<number | undefined>>;
	setPitchY: Dispatch<SetStateAction<number | undefined>>;
	setShiftX: Dispatch<SetStateAction<number | undefined>>;
	setShiftY: Dispatch<SetStateAction<number | undefined>>;
	customDesign: Omit<Design, "enabled">;
}

export const useCustomParam = (): UseCustomParam => {
	const [category, setCategory] = useAtom(categoryAtom);
	const [tone, setTone] = useAtom(toneAtom);
	const [sizeX, setSizeX] = useAtom(sizeXAtom);
	const [sizeY, setSizeY] = useAtom(sizeYAtom);
	const [pitchX, setPitchX] = useAtom(pitchXAtom);
	const [pitchY, setPitchY] = useAtom(pitchYAtom);
	const [shiftX, setShiftX] = useAtom(shiftXAtom);
	const [shiftY, setShiftY] = useAtom(shiftYAtom);
	const enableLayoutX = useAtomValue(enableLayoutXSelector);
	const enableLayoutY = useAtomValue(enableLayoutYSelector);

	const customDesign: Omit<Design, "enabled"> = {
		designType: "Custom",
		manualLayout: {
			tone,
			category,
			// 非活性項目も送信対象となるのでそのまま設定
			sizeX,
			sizeY,
			pitchX,
			pitchY,
			shiftX,
			shiftY,
		},
	};

	return {
		category,
		tone,
		sizeX,
		sizeY,
		pitchX,
		pitchY,
		shiftX,
		shiftY,
		enableLayoutX,
		enableLayoutY,
		setCategory,
		setTone,
		setSizeX,
		setSizeY,
		setPitchX,
		setPitchY,
		setShiftX,
		setShiftY,
		customDesign,
	};
};
