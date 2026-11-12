import type { Meta, StoryObj } from "@storybook/react";
import { useEffect, useState } from "react";

import { LabeledSlider, type SliderProp } from "../LabeledSlider";

type Props = Omit<SliderProp, "setNum">;
const LabeledSliderMock = (props: Props): JSX.Element => {
	const [num, setNum] = useState(props.num);

	useEffect(() => {
		setNum(props.num);
	}, [props.num]);

	return (
		<LabeledSlider
			label={props.label}
			num={num}
			setNum={setNum}
			min={props.min}
			max={props.max}
			step={props.step}
			decimalPlaces={props.decimalPlaces}
			disabled={props.disabled}
			labelXs={props.labelXs}
			track={props.track}
		/>
	);
};

const meta = {
	component: LabeledSliderMock,
} satisfies Meta<typeof LabeledSlider>;

export default meta;
type Story = StoryObj<typeof LabeledSliderMock>;

export const Default: Story = {
	args: {
		label: "LabeledSlider",
		num: 50,
		min: 0,
		max: 100,
		decimalPlaces: 0,
		disabled: false,
		labelXs: 2,
		track: "inverted",
	},
};
