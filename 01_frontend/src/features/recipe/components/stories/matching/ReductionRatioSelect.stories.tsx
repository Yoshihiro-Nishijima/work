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
import { ReductionRatioSelect } from "../../matching";

type Props = ComponentProps<typeof ReductionRatioSelect> & {
	reductionRatio: ReductionRatio | undefined;
	disabledImitation: boolean;
};
const MockReductionRatioSelect = (props: Props): JSX.Element => {
	const [reductionRatio, setReductionRatio] = useState<
		ReductionRatio | undefined
	>(props.reductionRatio);

	useMatchingParam.mockReturnValue({
		layerType: "All",
		searchArea: 0,
		matchingArea: "Original",
		matchingMethod: "Imitation",
		erosionMitigation: undefined,
		alignmentMode: undefined,
		reductionRatio,
		disabledImitation: () => {
			return props.disabledImitation;
		},
		searchAreaRange: [],
	});

	useSetMatchingParam.mockReturnValue({
		setMatchingParam: (value: MatchingParam) => ({}),
		setLayerType: (value: MatchingLayerType) => ({}),
		setSearchArea: (value: number) => ({}),
		setMatchingArea: (value: MatchingArea) => ({}),
		setMatchingMethod: (value: MatchingMethod) => ({}),
		setErosionMitigation: (value: ErosionMitigation | undefined) => ({}),
		setAlignmentMode: (value: AlignmentMode | undefined) => ({}),
		setReductionRatio,
	});

	useEffect(() => {
		setReductionRatio(props.reductionRatio);
	}, [props.reductionRatio]);

	return <ReductionRatioSelect />;
};

const meta = {
	component: MockReductionRatioSelect,
} satisfies Meta<typeof MockReductionRatioSelect>;
export default meta;
type Story = StoryObj<typeof MockReductionRatioSelect>;

export const Default: Story = {
	args: {
		reductionRatio: "1/1",
	},
	argTypes: {
		reductionRatio: {
			options: ["1/1", "1/2"],
			control: { type: "inline-radio" },
		},
	},
};
