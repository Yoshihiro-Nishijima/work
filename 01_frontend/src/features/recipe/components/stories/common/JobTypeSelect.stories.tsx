import type { Meta, StoryObj } from "@storybook/react";
import { type ComponentProps, useEffect, useState } from "react";

import { useRecipeCommonParams } from "~/features/recipe/hooks/mocks/useRecipeCommonParam.mock";

import type { JobType } from "../../../types/CommonParam";
import { JobTypeSelect } from "../../common";

type Props = ComponentProps<typeof JobTypeSelect> & {
	jobType: JobType;
};
const JobTypeSelectMock = (props: Props): JSX.Element => {
	const [jobType, setJobType] = useState(props.jobType);

	useRecipeCommonParams.mockReturnValue({
		jobType,
		numDefects: 100,
		designType: "Imported",
		outputDesignBasedDefectCoords: false,
		uploadParam0: {},
		uploadParam1: {},
		comment: "",
		commonBase: { fileID: "", version: 1, revision: 0, comment: "" },
		jobName: "",
		enableImported: false,
		modeTabIdxes: [],
		setJobType,
		setNumDefects(value) {},
		setOutputDesignBasedDefectCoords(value) {},
		setUploadParam0: (value) => {},
		setUploadParam1: (value) => {},
		setComment: (value: string) => {},
		setDesignType: (value) => {},
	});

	useEffect(() => {
		setJobType(props.jobType);
	}, [props.jobType]);

	return <JobTypeSelect />;
};

const meta = {
	component: JobTypeSelectMock,
} satisfies Meta<typeof JobTypeSelect>;

export default meta;
type Story = StoryObj<typeof JobTypeSelectMock>;

export const Default: Story = {
	args: {
		jobType: "Matching",
	},
	argTypes: {
		jobType: {
			options: [
				"Matching",
				"Trainable D2DB",
				"Trainable D2D",
				"D2D",
				"C2C",
				"Camera",
			],
			control: { type: "inline-radio" },
		},
	},
};
