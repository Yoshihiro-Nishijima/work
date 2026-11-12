import type { Meta, StoryObj } from "@storybook/react";
import { type ComponentProps, useEffect, useState } from "react";

import { useRecipeCommonParams } from "~/features/recipe/hooks/mocks/useRecipeCommonParam.mock";

import type { DesignType } from "../../../types/CommonParam";
import { DesignTypeSelect } from "../../common";

type Props = ComponentProps<typeof DesignTypeSelect> & {
	designType?: DesignType;
};
const DesignTypeSelectMock = (props: Props): JSX.Element => {
	const [designType, setDesignType] = useState(props.designType);

	useRecipeCommonParams.mockReturnValue({
		jobType: "Matching",
		numDefects: 100,
		designType,
		outputDesignBasedDefectCoords: false,
		uploadParam0: {},
		uploadParam1: {},
		comment: "",
		commonBase: { fileID: "", version: 1, revision: 0, comment: "" },
		jobName: "",
		enableImported: false,
		modeTabIdxes: [],
		setJobType: (value) => {},
		setNumDefects(value) {},
		setOutputDesignBasedDefectCoords(value) {},
		setUploadParam0: (value) => {},
		setUploadParam1: (value) => {},
		setComment: (value: string) => {},
		setDesignType,
	});

	useEffect(() => {
		setDesignType(props.designType);
	}, [props.designType]);

	return <DesignTypeSelect />;
};

const meta = {
	component: DesignTypeSelectMock,
} satisfies Meta<typeof DesignTypeSelect>;

export default meta;
type Story = StoryObj<typeof DesignTypeSelectMock>;

export const Default: Story = {
	args: {
		designType: "Imported",
	},
	argTypes: {
		designType: {
			options: ["Imported", "Custom"],
			control: { type: "inline-radio" },
		},
	},
};
