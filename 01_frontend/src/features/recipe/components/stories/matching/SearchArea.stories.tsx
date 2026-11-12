import type { Meta, StoryObj } from "@storybook/react";
import { type ComponentProps, useEffect, useState } from "react";

import {
	useMatchingParam,
	useSetMatchingParam,
} from "~/features/recipe/hooks/mocks/useMatchingParam.mock";

import type {
	AlignmentMode,
	ErosionMitigation,
	MatchingArea,
	MatchingLayerType,
	MatchingMethod,
	MatchingParam,
	ReductionRatio,
} from "../../../types";
import { SearchArea } from "../../matching";

type Props = ComponentProps<typeof SearchArea> & {
	searchArea?: number;
	searchAreaRange?: number[];
};
const SearchAreaMock = (props: Props): JSX.Element => {
	const [searchArea, setSearchArea] = useState(props.searchArea);

	useMatchingParam.mockReturnValue({
		layerType: "All",
		searchArea: searchArea ?? 0,
		matchingArea: "Original",
		matchingMethod: "Imitation",
		erosionMitigation: undefined,
		alignmentMode: undefined,
		reductionRatio: undefined,
		disabledImitation: () => {
			return false;
		},
		searchAreaRange: props.searchAreaRange ?? [0, 0],
	});

	useSetMatchingParam.mockReturnValue({
		setMatchingParam: (value: MatchingParam) => ({}),
		setLayerType: (value: MatchingLayerType) => ({}),
		setSearchArea,
		setMatchingArea: (value: MatchingArea) => ({}),
		setMatchingMethod: (value: MatchingMethod) => ({}),
		setErosionMitigation: (value: ErosionMitigation | undefined) => ({}),
		setAlignmentMode: (value: AlignmentMode | undefined) => ({}),
		setReductionRatio: (value: ReductionRatio | undefined) => ({}),
	});

	useEffect(() => {
		setSearchArea(props.searchArea);
	}, [props.searchArea]);

	return <SearchArea />;
};

const meta = {
	component: SearchAreaMock,
} satisfies Meta<typeof SearchArea>;

export default meta;
type Story = StoryObj<typeof SearchAreaMock>;

export const Default: Story = {
	args: {
		searchArea: 2,
		searchAreaRange: [2, 26],
	},
	argTypes: {
		searchAreaRange: {
			description: "searchAreaRange[0]:min <br> searchAreaRange[1]:max",
		},
	},
};
