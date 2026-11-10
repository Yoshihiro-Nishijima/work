import type { GridFilterItem } from "@mui/x-data-grid-pro";

export const getDefectHistogramFilterSnapshot = (
	item: GridFilterItem,
): GridFilterItem | undefined => {
	const hasValue = item.value != null && item.value !== "";
	const doesNotRequireValue =
		item.operator === "isEmpty" || item.operator === "isNotEmpty";
	if (!hasValue && !doesNotRequireValue) return undefined;
	return {
		field: item.field,
		operator: item.operator,
		value: item.value,
	};
};
