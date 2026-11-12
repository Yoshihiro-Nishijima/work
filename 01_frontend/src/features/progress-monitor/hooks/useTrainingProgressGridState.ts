import type {
	GridColumnVisibilityModel,
	GridSortModel,
} from "@mui/x-data-grid-pro";
import { atom, useAtom } from "jotai";
import { toGridSortModel } from "~/features/job-manager-info/types";
import { DEFAULT_SORT } from "./useTrainingProgressInfo";

/**
 * TrainingProgressDataGridの表示設定管理
 * - カラム表示/非表示
 * - ソート
 */

const columnVisibilityAtom = atom<GridColumnVisibilityModel>();
const sortAtom = atom(toGridSortModel(DEFAULT_SORT));

interface UseTrainingProgressGridState {
	columnVisibilityModel: GridColumnVisibilityModel | undefined;
	setColumnVisibilityModel: (model: GridColumnVisibilityModel) => void;
	sort: GridSortModel;
	setSort: (sort: GridSortModel) => void;
}

export const useTrainingProgressGridState =
	(): UseTrainingProgressGridState => {
		const [columnVisibilityModel, setColumnVisibilityModel] =
			useAtom(columnVisibilityAtom);
		const [sort, setSort] = useAtom(sortAtom);

		return {
			columnVisibilityModel,
			setColumnVisibilityModel,
			sort,
			setSort,
		};
	};
