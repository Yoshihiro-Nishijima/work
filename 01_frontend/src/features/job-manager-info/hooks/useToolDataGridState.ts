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
 * ToolDataDataGridの表示設定管理
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
};

const toolDataPaginationAtom = atom(DEFAULT_PAGINATION);
const toolDataColumnVisibilityAtom = atom<
	GridColumnVisibilityModel | undefined
>(DEFAULT_COLUMN_VISIBILITY);
const toolDataFilterModelAtom = atom(DEFAULT_FILTER_MODEL);
const toolDataSortAtom = atom(toGridSortModel(DEFAULT_SORT));

interface UseToolDataGridState {
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

export const useToolDataGridState = (): UseToolDataGridState => {
	const [pagination, setPagination] = useAtom(toolDataPaginationAtom);
	const [columnVisibilityModel, setColumnVisibilityModel] = useAtom(
		toolDataColumnVisibilityAtom,
	);
	const [filterModel, setFilterModel] = useAtom(toolDataFilterModelAtom);
	const [sort, setSort] = useAtom(toolDataSortAtom);

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
