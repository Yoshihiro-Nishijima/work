import Crop75Icon from "@mui/icons-material/Crop75";
import FluorescentIcon from "@mui/icons-material/Fluorescent";
import Grid4x4Icon from "@mui/icons-material/Grid4x4";
import type { Meta, StoryObj } from "@storybook/react";
import { type ComponentProps, useEffect, useState } from "react";

import { SFovViewToggle } from "../SFovViewToggle";

type Props = Omit<
	ComponentProps<typeof SFovViewToggle>,
	"handleChangeToggleEvent"
>;
const SFovViewToggleMock = (props: Props): JSX.Element => {
	const [isSelected, seiIsSelected] = useState(props.isSelected);
	const [value, setValue] = useState(props.value);

	useEffect(() => {
		seiIsSelected(props.isSelected);
	}, [props.isSelected]);

	return (
		<div>
			<SFovViewToggle
				title={props.title}
				toggleIcon={props.toggleIcon}
				isSelected={isSelected}
				isDisabled={props.isDisabled}
				value={props.value}
				handleChangeToggleEvent={(e: React.MouseEvent, value: string) => {
					seiIsSelected(!isSelected);
					setValue(value);
				}}
			/>
			<br />
			ToggleButton選択時のvalueの値: {value}
		</div>
	);
};

const meta = {
	component: SFovViewToggleMock,
} satisfies Meta<typeof SFovViewToggle>;

export default meta;
type Story = StoryObj<typeof SFovViewToggleMock>;

export const Default: Story = {
	args: {
		title: "Emphasis",
		toggleIcon: <Crop75Icon />,
		isSelected: false,
		isDisabled: false,
		value: "Emphasis",
	},
	argTypes: {
		toggleIcon: {
			options: ["Crop75Icon", "FluorescentIcon", "Grid4x4Icon"],
			control: { type: "inline-radio" },
			mapping: {
				Crop75Icon: <Crop75Icon />,
				FluorescentIcon: <FluorescentIcon />,
				Grid4x4Icon: <Grid4x4Icon />,
			},
			description: "初期値はCrop75Icon",
		},
	},
};
