import TextField from "@mui/material/TextField";
import type { GridFilterOperator } from "@mui/x-data-grid-pro";
import { useState } from "react";

/**
 * Defect用のDataGridで使用する Layer列用フィルタ定義
 * 数字のカンマ区切り文字列で指定して数値配列をフィルタ条件として使用
 */
export const LayerFilterOperator: GridFilterOperator = {
	label: "isAnyOf",
	value: "isAnyOf",
	getApplyFilterFn: (filterItem) => {
		if (!filterItem.value) return null;
		const filterValues = filterItem.value
			.split(",")
			.map((value: string) => Number(value.trim()))
			.filter((value: number) => !Number.isNaN(value));

		return (params) => {
			if (!Array.isArray(params)) return false;
			return filterValues.some((value: number) => params.includes(value));
		};
	},
	InputComponent: ({ item, applyValue }) => {
		const [layers, setLayers] = useState(item.value || "");
		const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
			const newValue = e.target.value.replace(/[^0-9,]/g, "");
			// テキストフィールドは数字とカンマのみ反映
			setLayers(newValue);

			if (!/\d\s*$/.test(newValue.trim())) return;
			const newValueArray = newValue
				.split(",")
				.map((value: string) => Number(value.trim()));
			// layer数値に変更がない場合にリクエストを送らないように更新前に判定
			const sameValue = () => {
				const newValueSet = new Set(newValueArray);
				const currentSet = new Set(item.value);
				if (currentSet.size !== newValueSet.size) return false;
				for (const val of newValueSet) {
					if (!currentSet.has(val)) return false;
				}
				return true;
			};
			if (sameValue()) return;
			applyValue({ ...item, value: newValueArray });
		};
		return (
			<TextField
				label="layer(Comma-separated)"
				value={layers}
				onChange={handleChange}
				size="small"
				fullWidth
				placeholder="e.g.: 1, 2, 3"
				autoFocus
			/>
		);
	},
};
