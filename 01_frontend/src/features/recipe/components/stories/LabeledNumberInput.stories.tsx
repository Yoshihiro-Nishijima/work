import type { Meta, StoryObj } from "@storybook/react";
import { useEffect, useState } from "react";

import {
	LabeledNumberInput,
	type NumberInputProp,
} from "../LabeledNumberInput";

type Props = Omit<NumberInputProp, "setNum">;
const LabeledNumberInputMock = (props: Props): JSX.Element => {
	const [num, setNum] = useState(props.num);

	useEffect(() => {
		setNum(props.num);
	}, [props.num]);

	return (
		<LabeledNumberInput
			label={props.label}
			num={num}
			setNum={setNum}
			step={props.step}
			min={props.min}
			max={props.max}
			disabled={props.disabled}
			labelXs={props.labelXs}
			decimalPlaces={props.decimalPlaces}
		/>
	);
};

const meta = {
	component: LabeledNumberInputMock,
} satisfies Meta<typeof LabeledNumberInput>;

export default meta;
type Story = StoryObj<typeof LabeledNumberInputMock>;

export const Default: Story = {
	args: {
		label: "LabeledNumberInput",
		num: 0,
		step: 1,
		min: 0,
		max: 100,
		disabled: false,
		labelXs: 5,
		decimalPlaces: 0,
	},
};
