import type {
	GridColumnVisibilityModel,
	GridFilterModel,
	GridSortModel,
} from "@mui/x-data-grid-pro";
import { GridLogicOperator } from "@mui/x-data-grid-pro";
import { atom, useAtom } from "jotai";
import {
	type Pagination,
	type Sort,
	toGridSortModel,
} from "~/features/job-manager-info/types";
import { DEFAULT_PAGINATION } from "./useSearchResults";

/**
 * DesignDataDataGridの表示設定管理
 * - ページ
 * - カラム表示/非表示
 * - フィルタ
 * - ソート
 */

const DEFAULT_DESIGN_SORT: Sort[] = [
	{
		field: "importDate",
		direction: "desc",
	},
];

const DEFAULT_FILTER_MODEL: GridFilterModel = {
	items: [],
	logicOperator: GridLogicOperator.And,
};

const designPaginationAtom = atom(DEFAULT_PAGINATION);
const designColumnVisibilityAtom = atom<GridColumnVisibilityModel | undefined>(
	undefined,
);
const designFilterModelAtom = atom(DEFAULT_FILTER_MODEL);
const designSortAtom = atom(toGridSortModel(DEFAULT_DESIGN_SORT));

interface UseDesignGridState {
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

export const useDesignGridState = (): UseDesignGridState => {
	const [pagination, setPagination] = useAtom(designPaginationAtom);
	const [columnVisibilityModel, setColumnVisibilityModel] = useAtom(
		designColumnVisibilityAtom,
	);
	const [filterModel, setFilterModel] = useAtom(designFilterModelAtom);
	const [sort, setSort] = useAtom(designSortAtom);

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
