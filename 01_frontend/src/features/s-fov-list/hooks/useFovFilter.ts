import {
	type GridColDef,
	type GridFilterModel,
	GridLogicOperator,
} from "@mui/x-data-grid-pro";
import { atom, useAtom } from "jotai";
import {
	type Dispatch,
	type SetStateAction,
	useCallback,
	useState,
} from "react";

const DEFAULT_FILTER_ITEM: GridFilterModel = {
	items: [],
	logicOperator: GridLogicOperator.And,
};

const filterAtom = atom(DEFAULT_FILTER_ITEM);
const filterColumnAtom = atom<GridColDef[]>([]);

interface UseFovFilter {
	filter: GridFilterModel;
	initFilterData: (columns: GridColDef[]) => void;
	setGridFilterData: (model: GridFilterModel, inProgress: boolean) => void;
	filterColumns: GridColDef[];
	filterManagement: GridFilterModel;
	setFilterManagement: Dispatch<SetStateAction<GridFilterModel>>;
}

export const useFovFilter = (): UseFovFilter => {
	const [filter, setFilter] = useAtom(filterAtom);
	const [filterManagement, setFilterManagement] = useState(DEFAULT_FILTER_ITEM);
	const [filterColumns, setFilterColumns] = useAtom(filterColumnAtom);

	const initFilterData: (columns: GridColDef[]) => void = useCallback(
		(columns: GridColDef[]) => {
			// クエリ変換用
			setFilterColumns(columns);

			// 内部管理用(DataGrid設定用)
			setFilterManagement(filter);
		},
		[filter, setFilterColumns],
	);

	const setGridFilterData: (
		model: GridFilterModel,
		inProgress: boolean,
	) => void = useCallback(
		(model: GridFilterModel, inProgress: boolean) => {
			if (model.items.length === 0) {
				setFilter(DEFAULT_FILTER_ITEM);
				setFilterManagement(DEFAULT_FILTER_ITEM);
				return;
			}

			// 内部管理用(入力中の画面のみの仮設定。）
			setFilterManagement(model);

			if (inProgress) {
				return;
			}

			// タブ切替時参照用(Atomに格納)
			setFilter(model);
		},
		[setFilter],
	);

	return {
		filter,
		initFilterData,
		setGridFilterData,
		filterColumns,
		filterManagement,
		setFilterManagement,
	};
};
