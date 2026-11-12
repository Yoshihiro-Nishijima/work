import { Autocomplete } from "@mui/material";
import TextField from "@mui/material/TextField";
import type { GridFilterItem, GridFilterOperator } from "@mui/x-data-grid-pro";
import type React from "react";
import { useState } from "react";
import { toSeconds } from "~/utils/formatter";

const createComparisonOperator = (
	label: string,
	value: string,
): GridFilterOperator => ({
	label,
	value,
	// クライント側でフィルタしないため省略
	getApplyFilterFn: () => null,
	InputComponent: ({ item, applyValue }) => {
		const [time, setTime] = useState(item.value || "");
		const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
			// テキストフィールドは数字とコロンのみ反映
			const newValueString = e.target.value.replace(/[^\d:]/g, "");
			setTime(newValueString);

			// hh:mm:ss形式の途中でリクエストを送らない
			const timeRegex = /^\d+:[0-5][0-9]:[0-5][0-9]$/;
			if (!timeRegex.test(newValueString)) return;

			// 変更がない場合にリクエストを送らない
			if (newValueString === item.value) return;
			applyValue({ ...item, value: newValueString });
		};
		return (
			<TextField
				label="Value"
				value={time}
				onChange={handleChange}
				size="small"
				fullWidth
				placeholder="hh:mm:ss"
				autoFocus
				// フィルタダイアログのColumnsやOperatorとの縦位置を合わせる
				sx={{ paddingTop: "3px" }}
			/>
		);
	},
});

const createEmptyOperator = (
	label: string,
	value: string,
): GridFilterOperator => ({
	label,
	value,
	// クライント側でフィルタしないため省略
	getApplyFilterFn: () => null,
	// 入力不要
	InputComponent: () => null,
});

const isAnyOfOperator: GridFilterOperator = {
	label: "is any of",
	value: "isAnyOf",
	// クライント側でフィルタしないため省略
	getApplyFilterFn: () => null,
	InputComponent: ({ item, applyValue }) => {
		const [times, setTime] = useState(item.value || []);
		const timeRegex = /^\d+:[0-5][0-9]:[0-5][0-9]$/;

		const handleChange = (
			event: React.SyntheticEvent<Element, Event>,
			value: string[],
		) => {
			// 数字とコロンのみ反映
			const newValueStrings = value.map((value) =>
				value.replace(/[^\d:]/g, ""),
			);
			setTime(newValueStrings);

			// hh:mm:ss形式の途中でリクエストを送らない
			if (newValueStrings.some((value) => !timeRegex.test(value))) return;

			// 変更がない場合にリクエストを送らない
			const sameValue = () => {
				const newValueSet = new Set(newValueStrings);
				const currentSet = new Set(item.value);
				if (currentSet.size !== newValueSet.size) return false;
				for (const val of newValueSet) {
					if (!currentSet.has(val)) return false;
				}
				return true;
			};
			if (sameValue()) return;
			applyValue({ ...item, value: newValueStrings });
		};

		return (
			<Autocomplete
				multiple
				freeSolo
				options={[]}
				value={times}
				onChange={handleChange}
				size="small"
				fullWidth
				autoFocus
				renderInput={(params) => (
					<TextField
						{...params}
						label="Value"
						placeholder="Filter value(hh:mm:ss)"
					/>
				)}
			/>
		);
	},
};

/** ProcessTime用FilterOperator */
export const processTimeFilterOperators: GridFilterOperator[] = [
	createComparisonOperator("=", "="),
	createComparisonOperator("!=", "!="),
	createComparisonOperator("<", "<"),
	createComparisonOperator("<=", "<="),
	createComparisonOperator(">", ">"),
	createComparisonOperator(">=", ">="),
	createEmptyOperator("is empty", "isEmpty"),
	createEmptyOperator("is not empty", "isNotEmpty"),
	isAnyOfOperator,
];

export const convertProcessTimeFilterItem = (
	item: GridFilterItem,
): GridFilterItem => {
	if (typeof item.value === "string") {
		return {
			...item,
			value: toSeconds(item.value),
		};
	}

	if (Array.isArray(item.value)) {
		const convertedArray = item.value.map((v) =>
			typeof v === "string" ? toSeconds(v) : v,
		);
		return {
			...item,
			value: convertedArray,
		};
	}

	return item;
};
