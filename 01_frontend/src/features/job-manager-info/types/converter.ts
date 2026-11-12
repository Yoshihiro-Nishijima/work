import type { GridSortModel } from "@mui/x-data-grid-pro";

import type { Sort } from ".";

/**
 * MUI DataGridのソート条件ModelをAPI用のソート条件に変換
 * @param sortModel MUI DataGrid SortModel のソートModel
 * @returns SearchAPI向けソート条件
 */
export function toSortParam(sortModel: GridSortModel): Sort[] {
	return sortModel.map((s): Sort => {
		return {
			field: s.field,
			direction: s.sort ?? "asc",
		};
	});
}

/**
 * API用のソート条件をMUI DataGridのソート条件Modelに変換
 * @param sort SearchAPI向けソート条件
 * @returns MUI DataGrid SortModel のソートModel
 */
export function toGridSortModel(sort: Sort[]): GridSortModel {
	return sort.map((s) => ({
		field: s.field,
		sort: s.direction,
	}));
}
