import type { Meta, StoryObj } from "@storybook/react";
import { type ComponentProps, useEffect, useState } from "react";

import { useCustomParam } from "~/features/recipe/hooks/mocks/useCustomParam.mock";

import type { CategoryType } from "../../../types";
import { CategorySelect } from "../../custom";

type Props = ComponentProps<typeof CategorySelect> & {
	category: CategoryType | undefined;
};

const CategorySelectMock = (props: Props): JSX.Element => {
	const [category, setCategory] = useState(props.category);

	useCustomParam.mockReturnValue({
		category,
		tone: undefined,
		sizeX: undefined,
		sizeY: undefined,
		pitchX: undefined,
		pitchY: undefined,
		shiftX: undefined,
		shiftY: undefined,
		enableLayoutX: false,
		enableLayoutY: false,
		setCategory,
		setTone: (value) => {},
		setSizeX: (value) => {},
		setSizeY: (value) => {},
		setPitchX: (value) => {},
		setPitchY: (value) => {},
		setShiftX: (value) => {},
		setShiftY: (value) => {},
		customDesign: { designType: "Custom" },
	});

	useEffect(() => {
		setCategory(props.category);
	}, [props.category]);

	return <CategorySelect isReadonly={props.isReadonly} />;
};

const meta = {
	component: CategorySelectMock,
} satisfies Meta<typeof CategorySelectMock>;

export default meta;
type Story = StoryObj<typeof CategorySelectMock>;

export const Default: Story = {
	args: {
		category: "V-Line",
		isReadonly: false,
	},
	argTypes: {
		category: {
			options: ["V-Line", "H-Line", "Hole"],
			control: { type: "inline-radio" },
		},
	},
};
