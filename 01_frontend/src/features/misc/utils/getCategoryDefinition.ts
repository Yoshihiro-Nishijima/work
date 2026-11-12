import type { 
	CategorySymbolType,
	CategoryDefinition,
} from "~/features/misc/types/CategoryDefinition";

const CATEGORY_NUMBERS = [-1, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
const CATEGORY_NAMES = [
	"Unknown",
	"CAT1",
	"CAT2",
	"CAT3",
	"CAT4",
	"CAT5",
	"CAT6",
	"CAT7",
	"CAT8",
	"CAT9",
	"CAT10",
];
const CATEGORY_SYMBOLS: CategorySymbolType[] = [
	"Circle",
	"Circle",
	"Triangle",
	"Square",
	"Diamond",
	"Pentagon",
	"Hexagon",
	"Star",
	"Cross",
	"Plus",
	"Hourglass",
];
const CATEGORY_COLORS = [
	"black",
	"red",
	"blue",
	"green",
	"magenta",
	"cyan",
	"orange",
	"purple",
	"brown",
	"gray",
	"black",
];
const CATEGORY_ORDERS = [
	11,
	0,
	1,
	2,
	3,
	4,
	5,
	6,
	7,
	8,
	9,
	10,
];

export const getCategoryDefinition = (categoryNo: number): CategoryDefinition => {
	const categoryName = (categoryNo: number) => {
			if (categoryNo > 0 && categoryNo <= CATEGORY_NAMES.length) {
				return CATEGORY_NAMES[categoryNo];
			}
			return CATEGORY_NAMES[0];
	}
	const categoryColor = (categoryNo: number) => {
			if (categoryNo > 0 && categoryNo <= CATEGORY_COLORS.length) {
				return CATEGORY_COLORS[categoryNo];
			}
			return CATEGORY_COLORS[0];
	}
	const categorySymbol = (categoryNo: number) => {
			if (categoryNo > 0 && categoryNo <= CATEGORY_SYMBOLS.length) {
				return CATEGORY_SYMBOLS[categoryNo];
			}
			return CATEGORY_SYMBOLS[0];
	}
	const categoryOrder = (categoryNo: number) => {
			if (categoryNo > 0 && categoryNo <= CATEGORY_ORDERS.length) {
				return CATEGORY_ORDERS[categoryNo];
			}
			return CATEGORY_ORDERS[0];
	}
	const category: CategoryDefinition = {
		categoryNo: categoryNo,
		categoryName: categoryName(categoryNo),
		symbolType: categorySymbol(categoryNo),
		color: categoryColor(categoryNo),
		displayOrder: categoryOrder(categoryNo),
	};
	return (category);
};