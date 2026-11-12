import type { 
	CategorySymbolType,
	CategoryDefinition,
} from "~/features/misc/types/CategoryDefinition";

const circleSvg = (category: CategoryDefinition): JSX.Element => {
	return (
		<circle
			cx="12"
			cy="12"
			r="6"
			stroke={category.color}
			strokeWidth="2"
			fill={category.color}
		/>
	);
};
const triangleSvg = (category: CategoryDefinition): JSX.Element => {
	return (
		<polygon
			points="
                12,4
                20,18
                4,18
            "
			stroke={category.color}
			strokeWidth="2"
			fill={category.color}
		/>
	);
};
const squareSvg = (category: CategoryDefinition): JSX.Element => {
	return (
		<rect
			x="6"
			y="6"
			width="12"
			height="12"
			stroke={category.color}
			strokeWidth="2"
			fill={category.color}
		/>
	);
};
const diamondSvg = (category: CategoryDefinition): JSX.Element => {
	return (
		<polygon
			points="
                12,4
                20,12
                12,20
                4,12
            "
			stroke={category.color}
			strokeWidth="2"
			fill={category.color}
		/>
	);
};
const pentagonSvg = (category: CategoryDefinition): JSX.Element => {
	return (
		<polygon
			points="
                12,3
                21,9
                18,20
                6,20
                3,9
            "
			stroke={category.color}
			strokeWidth="2"
			fill={category.color}
		/>
	);
};
const hexSvg = (category: CategoryDefinition): JSX.Element => {
	return (
		<polygon
			points="
                6,4
                18,4
                22,12
                18,20
                6,20
                2,12
            "
			stroke={category.color}
			strokeWidth="2"
			fill={category.color}
		/>
	);
};
const starSvg = (category: CategoryDefinition): JSX.Element => {
	return (
		<polygon
			points="
                12,2
                14,9
                22,9
                16,13
                18,22
                12,17
                6,22
                8,13
                2,9
                10,9
            "
			stroke={category.color}
			strokeWidth="2"
			fill={category.color}
		/>
	);
};
const crossSvg = (category: CategoryDefinition): JSX.Element => {
	return (
		<polygon
			points="
                4,7
                7,4
                12,9
                17,4
                20,7
                15,12
                20,17
                17,20
                12,15
                7,20
                4,17
                9,12
            "
			stroke={category.color}
			strokeWidth="4"
			fill={category.color}
		/>
	);
};
const plusSvg = (category: CategoryDefinition): JSX.Element => {
	return (
		<polygon
			points="
                10,4
                14,4
                14,10
                20,10
                20,14
                14,14
                14,20
                10,20
                10,14
                4,14
                4,10
                10,10
            "
			stroke={category.color}
			strokeWidth="4"
			fill={category.color}
		/>
	);
};
const hourglassSvg = (category: CategoryDefinition): JSX.Element => {
	return (
		<polygon
			points="
                4,4
                20,4
                14,12
                20,20
                4,20
                10,12
            "
			stroke={category.color}
			strokeWidth="4"
			fill={category.color}
		/>
	);
};

export const CategorySymbolSvg = (category: CategoryDefinition): JSX.Element => {
	const svgRendererMap = new Map<CategorySymbolType, (category: CategoryDefinition) => JSX.Element>([
		["Circle", circleSvg],
		["Triangle", triangleSvg],
		["Square", squareSvg],
		["Diamond", diamondSvg],
		["Pentagon", pentagonSvg],
		["Hexagon", hexSvg],
		["Star", starSvg],
		["Cross", crossSvg],
		["Plus", plusSvg],
		["Hourglass", hourglassSvg],
	]);

	const renderer =
	    svgRendererMap.get(category.symbolType);

	return renderer
	? renderer(category)
	: <></>;
};
