import { atom, useAtom } from "jotai";
import type { Dispatch, SetStateAction } from "react";

const mapAreaWidthAtom = atom(300);

const mapAreaHeightAtom = atom(0);

interface UseMapAreaSize {
	mapAreaWidth: number;
	mapAreaHeight: number;
	setMapAreaWidth: Dispatch<SetStateAction<number>>;
	setMapAreaHeight: Dispatch<SetStateAction<number>>;
	calcAndSetMapAreaHeight: (
		height: number,
		margin: number,
		dispMapNum: number,
	) => void;
}

export const useMapAreaSize = (): UseMapAreaSize => {
	const [mapAreaWidth, setMapAreaWidth] = useAtom(mapAreaWidthAtom);
	const [mapAreaHeight, setMapAreaHeight] = useAtom(mapAreaHeightAtom);

	/**
	 * ResultViewer画面用の sFovMapの高さ計算
	 * @param	height: Mapエリア全体の高さ
	 * @param	margin: 各Mapのマージン(タイトルバーとか)
	 * @param	dispMapNum: Mapエリアに幾つのMapを表示するか
	 */
	const calcAndSetMapAreaHeight = (
		height: number,
		margin: number,
		dispMapNum: number,
	): void => {
		setMapAreaHeight((height - margin) / dispMapNum);
	};
	return {
		mapAreaWidth,
		mapAreaHeight,
		setMapAreaWidth,
		setMapAreaHeight,
		calcAndSetMapAreaHeight,
	};
};
