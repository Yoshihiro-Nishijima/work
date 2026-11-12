import { atom, useAtom } from "jotai";
import type { Dispatch, SetStateAction } from "react";

/* 画面の１列に表示可能な画像数 */
const columnCountAtom = atom(0);
const rowCountAtom = atom(0);

const gridWidthAtom = atom(0);
const gridHeightAtom = atom(0);

// ClippingDefectsGrid.tsx で定義しているデフォルト値を設定（初期レンダリング時の0除算を防ぐ）
// COLUMN_WIDTH = 170
const dynamicColumnWidthAtom = atom(170);
// IMAGE_AREA(128+16) + FIXED_TEXT_LINES(2)*TEXT_LINE_HEIGHT(24) + MARGIN(16) = 144 + 48 + 16 = 208
const dynamicRowHeightAtom = atom(208);

interface UseFixedSizeGridProp {
	columnCount: number;
	rowCount: number;
	gridWidth: number;
	gridHeight: number;
	dynamicColumnWidth: number;
	dynamicRowHeight: number;
	setColumnCount: Dispatch<SetStateAction<number>>;
	setRowCount: Dispatch<SetStateAction<number>>;
	setGridSize: (width: number, height: number) => void;
	setDynamicColumnWidth: Dispatch<SetStateAction<number>>;
	setDynamicRowHeight: Dispatch<SetStateAction<number>>;
}

export const useFixedSizeGridProp = (): UseFixedSizeGridProp => {
	const [columnCount, setColumnCount] = useAtom(columnCountAtom);
	const [rowCount, setRowCount] = useAtom(rowCountAtom);
	const [gridWidth, setGridWidth] = useAtom(gridWidthAtom);
	const [gridHeight, setGridHeight] = useAtom(gridHeightAtom);
	const [dynamicColumnWidth, setDynamicColumnWidth] = useAtom(
		dynamicColumnWidthAtom,
	);
	const [dynamicRowHeight, setDynamicRowHeight] = useAtom(dynamicRowHeightAtom);
	const setGridSize = (width: number, height: number): void => {
		setGridWidth(width);
		setGridHeight(height);
	};
	return {
		columnCount,
		rowCount,
		gridWidth,
		gridHeight,
		dynamicColumnWidth,
		dynamicRowHeight,
		setColumnCount,
		setRowCount,
		setGridSize,
		setDynamicColumnWidth,
		setDynamicRowHeight,
	};
};
