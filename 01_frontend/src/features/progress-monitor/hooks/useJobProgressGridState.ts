import type { GridColumnVisibilityModel } from "@mui/x-data-grid-pro";
import { atom, useAtom } from "jotai";

/**
 * JobProgressDataGridの表示設定管理
 * - カラム表示/非表示
 */

// カラム表示/非表示の初期状態
const DEFAULT_COLUMN_VISIBILITY: GridColumnVisibilityModel = {
	idw: false,
	idp: false,
	lotID: false,
	processID: false,
};

const columnVisibilityModelAtom = atom(DEFAULT_COLUMN_VISIBILITY);

interface UseJobProgressGridState {
	columnVisibilityModel: GridColumnVisibilityModel;
	setColumnVisibilityModel: (model: GridColumnVisibilityModel) => void;
}

export const useJobProgressGridState = (): UseJobProgressGridState => {
	const [columnVisibilityModel, setColumnVisibilityModel] = useAtom(
		columnVisibilityModelAtom,
	);

	return {
		columnVisibilityModel,
		setColumnVisibilityModel,
	};
};
