import type {
	GridColumnVisibilityModel,
	GridFilterModel,
	GridSortModel,
} from "@mui/x-data-grid-pro";
import { GridLogicOperator } from "@mui/x-data-grid-pro";
import { atom, useAtom } from "jotai";
import type { Pagination } from "~/features/job-manager-info/types";
import { toGridSortModel } from "~/features/job-manager-info/types";
import { DEFAULT_PAGINATION, DEFAULT_SORT } from "./useSearchResults";

/**
 * TrainableDataGridの表示設定管理
 * - ページ
 * - カラム表示/非表示
 * - フィルタ
 * - ソート
 * D2D と D2DB で別々の状態を管理
 */

const DEFAULT_FILTER_MODEL: GridFilterModel = {
	items: [],
	logicOperator: GridLogicOperator.And,
};

// D2D用のAtom
const trainableD2DPaginationAtom = atom(DEFAULT_PAGINATION);
const trainableD2DColumnVisibilityAtom = atom<
	GridColumnVisibilityModel | undefined
>(undefined);
const trainableD2DFilterModelAtom = atom(DEFAULT_FILTER_MODEL);
const trainableD2DSortAtom = atom(toGridSortModel(DEFAULT_SORT));

// D2DB用のAtom
const trainableD2DBPaginationAtom = atom(DEFAULT_PAGINATION);
const trainableD2DBColumnVisibilityAtom = atom<
	GridColumnVisibilityModel | undefined
>(undefined);
const trainableD2DBFilterModelAtom = atom(DEFAULT_FILTER_MODEL);
const trainableD2DBSortAtom = atom(toGridSortModel(DEFAULT_SORT));

interface UseTrainableGridState {
	pagination: Pagination;
	setPagination: (pagination: Pagination) => void;
	columnVisibilityModel: GridColumnVisibilityModel | undefined;
	setColumnVisibilityModel: (
		model: GridColumnVisibilityModel | undefined,
	) => void;
	filterModel: GridFilterModel;
	setFilterModel: (model: GridFilterModel) => void;
	sort: GridSortModel;
	setSort: (sort: GridSortModel) => void;
}

export const useTrainableGridState = (
	type: "D2D" | "D2DB",
): UseTrainableGridState => {
	// typeに応じて異なるAtomを使用
	const [d2dPagination, setD2DPagination] = useAtom(trainableD2DPaginationAtom);
	const [d2dColumnVisibilityModel, setD2DColumnVisibilityModel] = useAtom(
		trainableD2DColumnVisibilityAtom,
	);
	const [d2dFilterModel, setD2DFilterModel] = useAtom(
		trainableD2DFilterModelAtom,
	);
	const [d2dSort, setD2DSort] = useAtom(trainableD2DSortAtom);

	const [d2dbPagination, setD2DBPagination] = useAtom(
		trainableD2DBPaginationAtom,
	);
	const [d2dbColumnVisibilityModel, setD2DBColumnVisibilityModel] = useAtom(
		trainableD2DBColumnVisibilityAtom,
	);
	const [d2dbFilterModel, setD2DBFilterModel] = useAtom(
		trainableD2DBFilterModelAtom,
	);
	const [d2dbSort, setD2DBSort] = useAtom(trainableD2DBSortAtom);

	if (type === "D2D") {
		return {
			pagination: d2dPagination,
			setPagination: setD2DPagination,
			columnVisibilityModel: d2dColumnVisibilityModel,
			setColumnVisibilityModel: setD2DColumnVisibilityModel,
			filterModel: d2dFilterModel,
			setFilterModel: setD2DFilterModel,
			sort: d2dSort,
			setSort: setD2DSort,
		};
	}

	return {
		pagination: d2dbPagination,
		setPagination: setD2DBPagination,
		columnVisibilityModel: d2dbColumnVisibilityModel,
		setColumnVisibilityModel: setD2DBColumnVisibilityModel,
		filterModel: d2dbFilterModel,
		setFilterModel: setD2DBFilterModel,
		sort: d2dbSort,
		setSort: setD2DBSort,
	};
};
