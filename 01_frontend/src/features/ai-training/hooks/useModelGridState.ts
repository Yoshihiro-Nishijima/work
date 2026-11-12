import type {
	GridColumnVisibilityModel,
	GridFilterModel,
	GridSortModel,
} from "@mui/x-data-grid-pro";
import { GridLogicOperator } from "@mui/x-data-grid-pro";
import { atom, useAtom } from "jotai";
import { DEFAULT_PAGINATION } from "~/features/job-manager-info/hooks/useSearchResults";
import {
	type Pagination,
	type Sort,
	toGridSortModel,
} from "~/features/job-manager-info/types";

/**
 * ModelDataGridの表示設定管理
 * - ページ
 * - カラム表示/非表示
 * - フィルタ
 * - ソート
 */

export const MODEL_DEFAULT_SORT: Sort[] = [
	{
		field: "createdDate",
		direction: "desc",
	},
];

const DEFAULT_FILTER_MODEL: GridFilterModel = {
	items: [],
	logicOperator: GridLogicOperator.And,
};

const modelPaginationAtom = atom(DEFAULT_PAGINATION);
const modelColumnVisibilityAtom = atom<GridColumnVisibilityModel | undefined>();
const modelFilterModelAtom = atom(DEFAULT_FILTER_MODEL);
const modelSortAtom = atom(toGridSortModel(MODEL_DEFAULT_SORT));

interface UseModelGridState {
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

export const useModelGridState = (): UseModelGridState => {
	const [pagination, setPagination] = useAtom(modelPaginationAtom);
	const [columnVisibilityModel, setColumnVisibilityModel] = useAtom(
		modelColumnVisibilityAtom,
	);
	const [filterModel, setFilterModel] = useAtom(modelFilterModelAtom);
	const [sort, setSort] = useAtom(modelSortAtom);

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
