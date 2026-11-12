import { Typography } from "@mui/material";
import type { Meta, StoryObj } from "@storybook/react";
import { type ComponentProps, useState } from "react";

import { useCustomParam } from "~/features/recipe/hooks/mocks/useCustomParam.mock";

import type { CategoryType } from "../../../types";
import { CustomLayerSetting } from "../../custom";

type Props = ComponentProps<typeof CustomLayerSetting> & {
	category?: CategoryType;
	tone?: "Clear" | "Dark";
	sizeX?: number;
	sizeY?: number;
	pitchX?: number;
	pitchY?: number;
	shiftX?: number;
	shiftY?: number;
	enableLayoutX: boolean;
	enableLayoutY: boolean;
};
const MockCustomLayerSetting = (props: Props): JSX.Element => {
	const [category, setCategory] = useState(props.category);
	const [tone, setTone] = useState(props.tone);
	const [sizeX, setSizeX] = useState(props.sizeX);
	const [sizeY, setSizeY] = useState(props.sizeY);
	const [pitchX, setPitchX] = useState(props.pitchX);
	const [pitchY, setPitchY] = useState(props.pitchY);
	const [shiftX, setShiftX] = useState(props.shiftX);
	const [shiftY, setShiftY] = useState(props.shiftY);
	useCustomParam.mockReturnValue({
		category,
		tone,
		sizeX,
		sizeY,
		pitchX,
		pitchY,
		shiftX,
		shiftY,
		enableLayoutX: props.enableLayoutX,
		enableLayoutY: props.enableLayoutY,
		setCategory,
		setTone,
		setSizeX,
		setSizeY,
		setPitchX,
		setPitchY,
		setShiftX,
		setShiftY,
		customDesign: { designType: "Custom" },
	});
	return (
		<div>
			<Typography component="p" sx={{ width: "500px" }}>
				子要素でUseMemoを使用しているので
				isReadOnly以外のパラメータを修正した場合は
				左上のRemountボタンから再マウントを行わないと更新されません
			</Typography>
			<CustomLayerSetting isReadonly={props.isReadonly} />
		</div>
	);
};

const meta = {
	component: MockCustomLayerSetting,
} satisfies Meta<typeof MockCustomLayerSetting>;

export default meta;
type Story = StoryObj<typeof MockCustomLayerSetting>;

export const Default: Story = {
	args: {
		isReadonly: false,
		sizeX: 0,
		sizeY: 0,
		pitchX: 0,
		pitchY: 0,
		shiftX: 0,
		shiftY: 0,
		enableLayoutX: true,
		enableLayoutY: true,
	},
};
