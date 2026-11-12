import type {
	GridColDef,
	GridColType,
	GridFilterModel,
} from "@mui/x-data-grid-pro";
import { GridLogicOperator } from "@mui/x-data-grid-pro";

import type {
	Filter,
	Pagination,
	Sort,
} from "~/features/job-manager-info/types";

export function toPagingQueryParam(
	pagination?: Pagination,
	sort?: Sort[],
	filter?: Filter,
): string {
	const startQuery =
		pagination == null || pagination.page <= 0 || pagination.pageSize <= 0
			? undefined
			: `start=${pagination.page * pagination.pageSize}&`;
	const limitQuery =
		pagination == null || pagination.pageSize <= 0
			? undefined
			: `limit=${pagination.pageSize}&`;
	const sortArray =
		sort == null
			? []
			: sort
					.map((s) => {
						if (s.field == null || s.field === "") return undefined;
						return {
							field: s.field,
							direction: s.direction,
						};
					})
					.filter((s) => s != null);

	const sortQuery =
		sortArray.length === 0
			? undefined
			: `sort=${encodeURIComponent(JSON.stringify(sortArray))}&`;
	const filterQuery =
		filter == null || filter.items.length === 0
			? undefined
			: `filter=${encodeURIComponent(JSON.stringify(filter))}`;
	return [startQuery, limitQuery, sortQuery, filterQuery]
		.filter((s) => s != null)
		.join("");
}

// GUI設定フィルター -> Server Query実行用フィルターに変換
export function toSQLFilter(
	model?: GridFilterModel,
	columns?: GridColDef[],
): Filter | undefined {
	if (model == null || columns == null) return undefined;
	const filterItems = model.items
		.map((f) => {
			return {
				field: f.field,
				operator: f.operator,
				value: toSQLFilterValue(
					f.value,
					columns.find((column) => {
						return column.field === f.field;
					})?.type,
				),
			};
		})
		.filter(
			(f) =>
				!(
					f.value == null &&
					f.operator !== "isEmpty" &&
					f.operator !== "isNotEmpty"
				),
		);

	if (filterItems.length === 0) return undefined;

	return {
		items: filterItems,
		logicOperator: toSQLLogicOperator(model.logicOperator),
	};
}

export function toSQLLogicOperator(
	gridLogicOperator?: GridLogicOperator,
): "and" | "or" | undefined {
	if (gridLogicOperator == null) return undefined;
	return gridLogicOperator === GridLogicOperator.Or ? "or" : "and";
}

// MUI Grid Filter -> SQLite Query Filter
function toSQLFilterValue(
	value: number | string,
	type?: GridColType,
): number | string | undefined | (number | string)[] {
	const converter = (
		value: number | string,
		type?: GridColType,
	): number | string | undefined => {
		if (value == null || value === "") return undefined;
		if (type == null) return value;
		if (type === "number" && typeof value === "string")
			return Number.parseFloat(value);
		if (type === "date" && typeof value === "string") {
			return Math.floor(new Date(`${value}T00:00:00`).getTime() / 1000);
		}
		if (type === "datetime" && typeof value === "string") {
			return Math.floor(new Date(value).getTime() / 1000);
		}

		return value;
	};

	if (Array.isArray(value) && value.length > 0) {
		return value.map((v) => converter(v, type)).filter((v) => v != null);
	}

	return converter(value, type);
}

/**
 * フィルタモデルに入力中がないか判定
 * - フィルタ入力中でも確定してしまうため無駄なAPI呼出をしないようにここで検証してから setFilterを呼ぶこと
 * - この処理が無い場合"ADD FILTER"時、その後のCOLMUNS/Operator変更時(2個目以降未確定時）にも確定済み条件でAPIが呼ばれる
 * - isEmpty, isNotEmpty 以外は value 必須(空文字不可)
 * @param model フィルタモデル
 * @returns true:入力中 false:入力済み
 */
export function isFilterPending(model: GridFilterModel): boolean {
	return model.items.some(
		(newFilter) =>
			(newFilter.value == null || newFilter.value === "") &&
			!["isEmpty", "isNotEmpty"].includes(newFilter.operator),
	);
}
