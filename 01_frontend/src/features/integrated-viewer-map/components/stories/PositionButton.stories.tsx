import type { Meta, StoryObj } from "@storybook/react";

import { PositionButton } from "../PositionButton";

const meta = {
	component: PositionButton,
} satisfies Meta<typeof PositionButton>;

export default meta;
type Story = StoryObj<typeof PositionButton>;

export const Default: Story = {
	args: {
		bottom: "20px",
		right: "20px",
	},
	argTypes: {
		bottom: { control: "text" },
		right: { control: "text" },
	},
};
