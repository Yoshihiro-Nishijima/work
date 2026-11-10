import { atom, useAtomValue } from "jotai";

type CategoryDefinition = {
	categoryNo: number;
	label: string;
	color: string;
	order: number;
};

const categoryDefinitionsAtom = atom<CategoryDefinition[]>([
	{ categoryNo: -1, label: "Unknown", color: "#757575", order: 0 },
	{ categoryNo: 0, label: "Unclassified", color: "#9e9e9e", order: 1 },
	{ categoryNo: 1, label: "CAT1", color: "#1976d2", order: 2 },
	{ categoryNo: 2, label: "CAT2", color: "#388e3c", order: 3 },
	{ categoryNo: 3, label: "CAT3", color: "#f57c00", order: 4 },
	{ categoryNo: 4, label: "CAT4", color: "#7b1fa2", order: 5 },
	{ categoryNo: 5, label: "CAT5", color: "#c2185b", order: 6 },
	{ categoryNo: 6, label: "CAT6", color: "#00796b", order: 7 },
	{ categoryNo: 7, label: "CAT7", color: "#5d4037", order: 8 },
	{ categoryNo: 8, label: "CAT8", color: "#455a64", order: 9 },
	{ categoryNo: 9, label: "CAT9", color: "#512da8", order: 10 },
	{ categoryNo: 10, label: "CAT10", color: "#d32f2f", order: 11 },
]);

export const useDefectHistogramCategories = () => {
	const categories = useAtomValue(categoryDefinitionsAtom);
	return {
		getCategory: (categoryNo: number): CategoryDefinition =>
			categories.find((category) => category.categoryNo === categoryNo) ?? {
				categoryNo: -1,
				label: "Unknown",
				color: "#757575",
				order: 0,
			},
	};
};
