import type {
	GridColumnVisibilityModel,
	GridFilterModel,
	GridSortModel,
} from "@mui/x-data-grid-pro";
import { GridLogicOperator } from "@mui/x-data-grid-pro";
import { atom, useAtom } from "jotai";
import {
	type Pagination,
	toGridSortModel,
} from "~/features/job-manager-info/types";
import { DEFAULT_PAGINATION, DEFAULT_SORT } from "./useSearchResults";

/**
 * ResultsDataGridの表示設定管理
 * - ページ
 * - カラム表示/非表示
 * - フィルタ
 * - ソート
 */

const DEFAULT_FILTER_MODEL: GridFilterModel = {
	items: [],
	logicOperator: GridLogicOperator.And,
};
const DEFAULT_COLUMN_VISIBILITY: GridColumnVisibilityModel = {
	idw: false,
	idp: false,
	lotID: false,
	processID: false,
};

const resultsPaginationAtom = atom(DEFAULT_PAGINATION);
const resultsColumnVisibilityAtom = atom<GridColumnVisibilityModel | undefined>(
	DEFAULT_COLUMN_VISIBILITY,
);
const resultsFilterModelAtom = atom(DEFAULT_FILTER_MODEL);
const resultsSortAtom = atom(toGridSortModel(DEFAULT_SORT));

interface UseResultsGridState {
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

export const useResultsGridState = (): UseResultsGridState => {
	const [pagination, setPagination] = useAtom(resultsPaginationAtom);
	const [columnVisibilityModel, setColumnVisibilityModel] = useAtom(
		resultsColumnVisibilityAtom,
	);
	const [filterModel, setFilterModel] = useAtom(resultsFilterModelAtom);
	const [sort, setSort] = useAtom(resultsSortAtom);

	return {
		pagination,
		setPagination,
		columnVisibilityModel,
		setColumnVisibilityModel,
		filterModel,
		setFilterModel,
		sort,
		setSort,
	};
};
