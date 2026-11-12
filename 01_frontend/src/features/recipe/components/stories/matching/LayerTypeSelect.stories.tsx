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
import { LayerTypeSelect } from "../../matching";

type Props = ComponentProps<typeof LayerTypeSelect> & {
	layerType?: MatchingLayerType;
};
const LayerTypeSelectMock = (props: Props): JSX.Element => {
	const [layerType, setLayerType] = useState<MatchingLayerType>(
		props.layerType ?? "All",
	);

	useMatchingParam.mockReturnValue({
		layerType,
		searchArea: 0,
		matchingArea: "Original",
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
		setLayerType,
		setSearchArea: (value: number) => ({}),
		setMatchingArea: (value: MatchingArea) => ({}),
		setMatchingMethod: (value: MatchingMethod) => ({}),
		setErosionMitigation: (value: ErosionMitigation | undefined) => ({}),
		setAlignmentMode: (value: AlignmentMode | undefined) => ({}),
		setReductionRatio: (value: ReductionRatio | undefined) => ({}),
	});

	useEffect(() => {
		if (props.layerType) setLayerType(props.layerType);
	}, [props.layerType]);

	return <LayerTypeSelect />;
};

const meta = {
	component: LayerTypeSelectMock,
} satisfies Meta<typeof LayerTypeSelect>;

export default meta;
type Story = StoryObj<typeof LayerTypeSelectMock>;

export const Default: Story = {
	args: {
		layerType: "All",
	},
	argTypes: {
		layerType: {
			options: ["All", "Target"],
			control: { type: "inline-radio" },
		},
	},
};
