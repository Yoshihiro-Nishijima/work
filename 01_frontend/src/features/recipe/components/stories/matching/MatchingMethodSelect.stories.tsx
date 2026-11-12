import type { Meta, StoryObj } from "@storybook/react";
import { type ComponentProps, useEffect, useState } from "react";

import {
	useMatchingParam,
	useSetMatchingParam,
} from "~/features/recipe/hooks/mocks/useMatchingParam.mock";

import {
	type AlignmentMode,
	type ErosionMitigation,
	type MatchingArea,
	type MatchingLayerType,
	type MatchingMethod,
	MatchingMethodList,
	type MatchingParam,
	type ReductionRatio,
} from "../../../types";
import { MatchingMethodSelect } from "../../matching";

type Props = ComponentProps<typeof MatchingMethodSelect> & {
	matchingMethod?: MatchingMethod;
};
const MatchingMethodSelectMock = (props: Props): JSX.Element => {
	const [matchingMethod, setMatchingMethod] = useState<MatchingMethod>(
		props.matchingMethod ?? "Unique Plane",
	);

	useMatchingParam.mockReturnValue({
		layerType: "All",
		searchArea: 0,
		matchingArea: "Original",
		matchingMethod,
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
		setMatchingArea: (value: MatchingArea) => ({}),
		setMatchingMethod,
		setErosionMitigation: (value: ErosionMitigation | undefined) => ({}),
		setAlignmentMode: (value: AlignmentMode | undefined) => ({}),
		setReductionRatio: (value: ReductionRatio | undefined) => ({}),
	});

	useEffect(() => {
		if (props.matchingMethod) setMatchingMethod(props.matchingMethod);
	}, [props.matchingMethod]);

	return <MatchingMethodSelect />;
};

const meta = {
	component: MatchingMethodSelectMock,
} satisfies Meta<typeof MatchingMethodSelect>;

export default meta;
type Story = StoryObj<typeof MatchingMethodSelectMock>;

export const Default: Story = {
	args: {
		matchingMethod: "Unique Plane",
	},
	argTypes: {
		matchingMethod: {
			options: MatchingMethodList,
			control: { type: "inline-radio" },
		},
	},
};
