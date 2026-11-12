import { atom, useAtomValue } from "jotai";
import { useAtomCallback } from "jotai/utils";
import { useCallback } from "react";

// TODO useSfovnoForSEMImage, useMfovnoForSEMImage 等と
// 二重管理になっているのであとで整理
// 現時点ではこちらのAtomは未使用
const chipXAtom = atom<number | undefined>(undefined);
const chipYAtom = atom<number | undefined>(undefined);
const mFovNoAtom = atom<number | undefined>(undefined);
const sFovNoAtom = atom<number | undefined>(undefined);
// 現状使用しているのはこれのみ(SEMImageで表示するsFovのChip内座標)
const coordXAtom = atom<number | undefined>(undefined);
const coordYAtom = atom<number | undefined>(undefined);

// coordが設定済みか否か
export const existsCoordAtom = atom(
	(get) => get(coordXAtom) != null && get(coordYAtom) != null,
);

interface UseSEMImageValue {
	chipX?: number;
	chipY?: number;
	mFovNo?: number;
	sFovNo?: number;
	coordX?: number;
	coordY?: number;
}
/** sFovSEMImage表示に使用するFov情報管理(Getter) */
export const useSEMImageValue = (): UseSEMImageValue => {
	return {
		chipX: useAtomValue(chipXAtom),
		chipY: useAtomValue(chipYAtom),
		mFovNo: useAtomValue(mFovNoAtom),
		sFovNo: useAtomValue(sFovNoAtom),
		coordX: useAtomValue(coordXAtom),
		coordY: useAtomValue(coordYAtom),
	};
};

interface UseSetSEMImage {
	setChipIndex: (chipX: number, chipY: number) => void;
	setFovNo: (mFovNo: number, sFovNo: number) => void;
	setCoord: (coordX: number, coordY: number) => void;
	reset: () => void;
}
/** sFovSEMImage表示に使用するFov情報管理(Setter) */
export const useSetSEMImage = (): UseSetSEMImage => {
	const setChipIndex = useAtomCallback(
		useCallback((_, set, chipX: number, chipY: number) => {
			set(chipXAtom, chipX);
			set(chipYAtom, chipY);
		}, []),
	);

	const setFovNo = useAtomCallback(
		useCallback((_, set, mFovNo: number, sFovNo: number) => {
			set(mFovNoAtom, mFovNo);
			set(sFovNoAtom, sFovNo);
		}, []),
	);

	const setCoord = useAtomCallback(
		useCallback((_, set, coordX: number, coordY: number) => {
			set(coordXAtom, coordX);
			set(coordYAtom, coordY);
		}, []),
	);

	const reset = useAtomCallback(
		useCallback((_, set) => {
			set(chipXAtom, undefined);
			set(chipYAtom, undefined);
			set(mFovNoAtom, undefined);
			set(sFovNoAtom, undefined);
			set(coordXAtom, undefined);
			set(coordYAtom, undefined);
		}, []),
	);

	return {
		setChipIndex,
		setFovNo,
		setCoord,
		reset,
	};
};
