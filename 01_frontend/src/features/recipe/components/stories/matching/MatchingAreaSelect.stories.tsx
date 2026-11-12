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
import { MatchingAreaSelect } from "../../matching";

type Props = ComponentProps<typeof MatchingAreaSelect> & {
	matchingArea?: MatchingArea;
};
const MatchingAreaSelectMock = (props: Props): JSX.Element => {
	const [matchingArea, setMatchingArea] = useState<MatchingArea>(
		props.matchingArea ?? "Original",
	);

	useMatchingParam.mockReturnValue({
		layerType: "All",
		searchArea: 0,
		matchingArea,
		matchingMethod: "Imitation",
		erosionMitigation: undefined,
		alignmentMode: undefined,
		reductionRatio: undefined,
		disabledImitation: () => {
			return false;
		},
		searchAreaRange: [],
	});

	useSetMatchingParam.mockReturnValue({
		setMatchingParam: (value: MatchingParam) => ({}),
		setLayerType: (value: MatchingLayerType) => ({}),
		setSearchArea: (value: number) => ({}),
		setMatchingArea,
		setMatchingMethod: (value: MatchingMethod) => ({}),
		setErosionMitigation: (value: ErosionMitigation | undefined) => ({}),
		setAlignmentMode: (value: AlignmentMode | undefined) => ({}),
		setReductionRatio: (value: ReductionRatio | undefined) => ({}),
	});

	useEffect(() => {
		if (props.matchingArea) setMatchingArea(props.matchingArea);
	}, [props.matchingArea]);

	return <MatchingAreaSelect />;
};

const meta = {
	component: MatchingAreaSelectMock,
} satisfies Meta<typeof MatchingAreaSelect>;

export default meta;
type Story = StoryObj<typeof MatchingAreaSelectMock>;

export const Default: Story = {
	args: {
		matchingArea: "Original",
	},
	argTypes: {
		matchingArea: {
			options: ["Original", "2048", "1024", "512"],
			control: { type: "inline-radio" },
		},
	},
};
