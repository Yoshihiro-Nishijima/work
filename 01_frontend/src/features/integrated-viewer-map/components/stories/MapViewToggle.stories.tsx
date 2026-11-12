import CrisisAlertIcon from "@mui/icons-material/CrisisAlert";
import type { Meta, StoryObj } from "@storybook/react";
import { useEffect, useState } from "react";

import {
	MapViewToggle,
	type MapvViewToggleButtonProps,
} from "../MapViewToggle";

type Props = Omit<MapvViewToggleButtonProps, "handleChangeToggleEvent">;
const MapViewToggleMock = (props: Props): JSX.Element => {
	const [isSelected, setIsSelected] = useState(props.isSelected);
	const [value, setValue] = useState(props.value);

	useEffect(() => {
		setIsSelected(props.isSelected);
	}, [props.isSelected]);

	return (
		<div>
			<MapViewToggle
				title={props.title}
				toggleIcon={props.toggleIcon}
				isSelected={isSelected}
				isDisabled={props.isDisabled}
				value={props.value}
				handleChangeToggleEvent={(e: React.MouseEvent, value: string): void => {
					setIsSelected(!isSelected);
					setValue(value);
				}}
			/>
			<br />
			ToggleButton選択時のvalueの値: {value}
		</div>
	);
};

const meta = {
	component: MapViewToggleMock,
} satisfies Meta<typeof MapViewToggle>;

export default meta;
type Story = StoryObj<typeof MapViewToggleMock>;

export const Default: Story = {
	args: {
		title: "Defect",
		toggleIcon: <CrisisAlertIcon sx={{ mx: 0, p: 0 }} />,
		isSelected: false,
		isDisabled: false,
		value: "Defect",
	},
};
