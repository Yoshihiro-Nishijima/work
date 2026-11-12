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
import { AlignmentModeSelect } from "../../matching";

type Props = ComponentProps<typeof AlignmentModeSelect> & {
	alignmentMode: AlignmentMode | undefined;
	disabledImitation: boolean;
};
const MockAlignmentModeSelect = (props: Props): JSX.Element => {
	const [alignmentMode, setAlignmentMode] = useState<AlignmentMode | undefined>(
		props.alignmentMode,
	);

	useMatchingParam.mockReturnValue({
		layerType: "All",
		searchArea: 0,
		matchingArea: "Original",
		matchingMethod: "Imitation",
		erosionMitigation: undefined,
		alignmentMode,
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
		setErosionMitigation: (value: ErosionMitigation | undefined) => ({}),
		setAlignmentMode,
		setReductionRatio: (value: ReductionRatio | undefined) => ({}),
	});

	useEffect(() => {
		setAlignmentMode(props.alignmentMode);
	}, [props.alignmentMode]);

	return <AlignmentModeSelect />;
};

const meta = {
	component: MockAlignmentModeSelect,
} satisfies Meta<typeof MockAlignmentModeSelect>;
export default meta;
type Story = StoryObj<typeof MockAlignmentModeSelect>;

export const Default: Story = {
	args: {
		alignmentMode: "Auto",
		disabledImitation: false,
	},
	argTypes: {
		alignmentMode: {
			options: ["Auto", "Edge-based", "Contrast-based"],
			control: { type: "inline-radio" },
		},
	},
};
