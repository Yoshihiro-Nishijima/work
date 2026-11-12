export type CategorySymbolType =
	| "Circle"
	| "Triangle"
	| "Square"
	| "Diamond"
	| "Pentagon"
	| "Hexagon"
	| "Star"
 	| "Cross"
	| "Plus"
	| "Hourglass";

export interface CategoryDefinition {
	categoryNo: number;
	categoryName: string;
	symbolType: CategorySymbolType;
	color: string;
	displayOrder: number;
}
