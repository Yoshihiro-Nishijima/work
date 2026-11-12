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
 * DatasetDataGridの表示設定管理
 * - ページ
 * - カラム表示/非表示
 * - フィルタ
 * - ソート
 */

export const DATASET_DEFAULT_SORT: Sort[] = [
	{
		field: "createdDate",
		direction: "desc",
	},
];

const DEFAULT_FILTER_MODEL: GridFilterModel = {
	items: [],
	logicOperator: GridLogicOperator.And,
};

const datasetPaginationAtom = atom(DEFAULT_PAGINATION);
const datasetColumnVisibilityAtom = atom<
	GridColumnVisibilityModel | undefined
>();
const datasetFilterModelAtom = atom(DEFAULT_FILTER_MODEL);
const datasetSortAtom = atom(toGridSortModel(DATASET_DEFAULT_SORT));

interface UseDatasetGridState {
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

export const useDatasetGridState = (): UseDatasetGridState => {
	const [pagination, setPagination] = useAtom(datasetPaginationAtom);
	const [columnVisibilityModel, setColumnVisibilityModel] = useAtom(
		datasetColumnVisibilityAtom,
	);
	const [filterModel, setFilterModel] = useAtom(datasetFilterModelAtom);
	const [sort, setSort] = useAtom(datasetSortAtom);

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
