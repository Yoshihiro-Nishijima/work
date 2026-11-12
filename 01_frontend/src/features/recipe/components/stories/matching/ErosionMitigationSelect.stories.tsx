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
import { ErosionMitigationSelect } from "../../matching";

type Props = ComponentProps<typeof ErosionMitigationSelect> & {
	erosionMitigation: ErosionMitigation | undefined;
	disabledImitation: boolean;
};
const MockErosionMitigationSelect = (props: Props): JSX.Element => {
	const [erosionMitigation, setErosionMitigation] = useState<
		ErosionMitigation | undefined
	>(props.erosionMitigation);

	useMatchingParam.mockReturnValue({
		layerType: "All",
		searchArea: 0,
		matchingArea: "Original",
		matchingMethod: "Imitation",
		erosionMitigation,
		alignmentMode: undefined,
		reductionRatio: undefined,
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
		setErosionMitigation,
		setAlignmentMode: (value: AlignmentMode | undefined) => ({}),
		setReductionRatio: (value: ReductionRatio | undefined) => ({}),
	});

	useEffect(() => {
		setErosionMitigation(props.erosionMitigation);
	}, [props.erosionMitigation]);

	return <ErosionMitigationSelect />;
};

const meta = {
	component: MockErosionMitigationSelect,
} satisfies Meta<typeof MockErosionMitigationSelect>;
export default meta;
type Story = StoryObj<typeof MockErosionMitigationSelect>;

export const Default: Story = {
	args: {
		erosionMitigation: "Off",
		disabledImitation: false,
	},
	argTypes: {
		erosionMitigation: {
			options: [
				"Off",
				"1 pixel Erosion",
				"2 pixel Erosion",
				"3 pixel Erosion",
				"1 pixel Dilation",
				"2 pixel Dilation",
				"3 pixel Dilation",
			],
			control: { type: "inline-radio" },
		},
	},
};
