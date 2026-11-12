import type { Meta, StoryObj } from "@storybook/react";
import { useEffect, useState } from "react";

import {
	LabeledRangeSlider,
	type RangeSliderProp,
} from "../LabeledRangeSlider";

type Props = Omit<RangeSliderProp, "setNum">;
const LabeledRangeSliderMock = (props: Props): JSX.Element => {
	const [num, setNum] = useState(props.num);

	useEffect(() => {
		setNum(props.num);
	}, [props.num]);

	return (
		<LabeledRangeSlider
			label={props.label}
			num={num}
			setNum={setNum}
			min={props.min}
			max={props.max}
			step={props.step}
			decimalPlaces={props.decimalPlaces}
			disabled={props.disabled}
			labelXs={props.labelXs}
		/>
	);
};

const meta = {
	component: LabeledRangeSliderMock,
} satisfies Meta<typeof LabeledRangeSlider>;

export default meta;
type Story = StoryObj<typeof LabeledRangeSliderMock>;

export const Default: Story = {
	args: {
		label: "Range Slider",
		num: { min: 0, max: 100 },
		min: 0,
		max: 100,
		decimalPlaces: 0,
		disabled: false,
		labelXs: 2,
	},
};
