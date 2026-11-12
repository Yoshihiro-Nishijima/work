import type {
	GridColumnVisibilityModel,
	GridFilterModel,
} from "@mui/x-data-grid-pro";
import { GridLogicOperator } from "@mui/x-data-grid-pro";
import { atom, useAtom } from "jotai";
import { DEFAULT_PAGINATION } from "~/features/job-manager-info/hooks/useSearchResults";
import type { Pagination } from "~/features/job-manager-info/types";

/**
 * DeleteProgressDataGridの表示設定管理
 * - ページ
 * - カラム表示/非表示
 * - フィルタ
 */

const DEFAULT_FILTER_MODEL: GridFilterModel = {
	items: [],
	logicOperator: GridLogicOperator.And,
};

const paginationAtom = atom(DEFAULT_PAGINATION);
const columnVisibilityModelAtom = atom<GridColumnVisibilityModel | undefined>(
	undefined,
);
const filterModelAtom = atom(DEFAULT_FILTER_MODEL);

interface UseDeleteProgressGridState {
	pagination: Pagination;
	setPagination: (pagination: Pagination) => void;
	columnVisibilityModel: GridColumnVisibilityModel | undefined;
	setColumnVisibilityModel: (
		model: GridColumnVisibilityModel | undefined,
	) => void;
	filterModel: GridFilterModel;
	setFilterModel: (model: GridFilterModel) => void;
}

export const useDeleteProgressGridState = (): UseDeleteProgressGridState => {
	const [pagination, setPagination] = useAtom(paginationAtom);
	const [columnVisibilityModel, setColumnVisibilityModel] = useAtom(
		columnVisibilityModelAtom,
	);
	const [filterModel, setFilterModel] = useAtom(filterModelAtom);

	return {
		pagination,
		setPagination,
		columnVisibilityModel,
		setColumnVisibilityModel,
		filterModel,
		setFilterModel,
	};
};
