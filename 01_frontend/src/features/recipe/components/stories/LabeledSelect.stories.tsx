import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";

import { LabeledSelect, type SelectProp } from "../LabeledSelect";

type Props = Omit<SelectProp, "setItem">;
const LabeledSelectMock = (props: Props): JSX.Element => {
	const [item, setItem] = useState(props.item);

	return (
		<LabeledSelect
			label={props.label}
			item={item}
			setItem={setItem}
			selectOptions={props.selectOptions}
			selectOptionsText={props.selectOptionsText}
			disabled={props.disabled}
			labelXs={props.labelXs}
		/>
	);
};

const meta = {
	component: LabeledSelectMock,
} satisfies Meta<typeof LabeledSelect>;

export default meta;
type Story = StoryObj<typeof LabeledSelect>;

export const Default: Story = {
	args: {
		label: "Select",
		item: "AAA",
		selectOptions: ["AAA", "BBB", "CCC"],
		selectOptionsText: [],
		disabled: false,
		labelXs: 5,
	},
};
