import type { Meta, StoryObj } from "@storybook/react";
import { type ComponentProps, useEffect, useState } from "react";

import { useCustomParam } from "~/features/recipe/hooks/mocks/useCustomParam.mock";

import type { ToneType } from "../../../types";
import { ToneSelect } from "../../custom";

type Props = ComponentProps<typeof ToneSelect> & {
	tone: ToneType | undefined;
};

const ToneSelectMock = (props: Props): JSX.Element => {
	const [tone, setTone] = useState(props.tone);

	useCustomParam.mockReturnValue({
		category: undefined,
		tone,
		sizeX: undefined,
		sizeY: undefined,
		pitchX: undefined,
		pitchY: undefined,
		shiftX: undefined,
		shiftY: undefined,
		enableLayoutX: false,
		enableLayoutY: false,
		setCategory: (value) => {},
		setTone,
		setSizeX: (value) => {},
		setSizeY: (value) => {},
		setPitchX: (value) => {},
		setPitchY: (value) => {},
		setShiftX: (value) => {},
		setShiftY: (value) => {},
		customDesign: { designType: "Custom" },
	});

	useEffect(() => {
		setTone(props.tone);
	}, [props.tone]);

	return <ToneSelect isReadonly={props.isReadonly} />;
};

const meta = {
	component: ToneSelectMock,
} satisfies Meta<typeof ToneSelectMock>;

export default meta;
type Story = StoryObj<typeof ToneSelectMock>;

export const Default: Story = {
	args: {
		tone: "Clear",
		isReadonly: false,
	},
	argTypes: {
		tone: {
			options: ["Clear", "Dark"],
			control: { type: "inline-radio" },
		},
	},
};
