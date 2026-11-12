import { type GridFilterModel, GridLogicOperator } from "@mui/x-data-grid-pro";
import {
	type Dispatch,
	type SetStateAction,
	useCallback,
	useEffect,
	useState,
} from "react";

import { useDefect } from "../hooks/useDefect";

export const DEFAULT_FILTER_ITEM: GridFilterModel = {
	items: [],
	logicOperator: GridLogicOperator.And,
};

interface UseDefectFilter {
	setGridFilterData: (model: GridFilterModel, inProgress: boolean) => void;
	filterManagement: GridFilterModel | undefined;
	setFilterManagement: Dispatch<SetStateAction<GridFilterModel | undefined>>;
}

export const useDefectFilter = (): UseDefectFilter => {
	const { filter, setFilter } = useDefect();
	const [filterManagement, setFilterManagement] = useState<
		GridFilterModel | undefined
	>(DEFAULT_FILTER_ITEM);

	useEffect(() => {
		if (filter != null) {
			// 内部管理用（フィルタありの場合も、クリアされた場合も同期）
			setFilterManagement(filter);
		}
	}, [filter]);

	const setGridFilterData: (
		model: GridFilterModel,
		inProgress: boolean,
	) => void = useCallback(
		(model: GridFilterModel, inProgress: boolean) => {
			if (model == null || model.items.length === 0) {
				setFilter(DEFAULT_FILTER_ITEM);
				setFilterManagement(DEFAULT_FILTER_ITEM);
				return;
			}

			// 入力途中用の仮設定(管理用情報のみ更新)
			setFilterManagement(model);

			if (inProgress) {
				return;
			}

			// タブ切り替え時状態保持用Setter(setFilter)を更新
			setFilter(model);
		},
		[setFilter],
	);

	return {
		setGridFilterData,
		filterManagement,
		setFilterManagement,
	};
};
