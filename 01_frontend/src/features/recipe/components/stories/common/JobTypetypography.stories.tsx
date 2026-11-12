import type { Meta, StoryObj } from "@storybook/react";
import type { ComponentProps } from "react";

import { useJobType } from "~/features/recipe/hooks/mocks/useRecipeCommonParam.mock";

import type { JobType } from "../../../types/CommonParam";
import { JobTypeTypography } from "../../common";

type Props = ComponentProps<typeof JobTypeTypography> & {
	jobType: JobType;
};
const JobTypeTypographyMock = (props: Props): JSX.Element => {
	useJobType.mockReturnValue(props.jobType);
	return <JobTypeTypography />;
};

const meta = {
	component: JobTypeTypographyMock,
} satisfies Meta<typeof JobTypeTypography>;

export default meta;
type Story = StoryObj<typeof JobTypeTypographyMock>;

export const Default: Story = {
	args: {
		jobType: "Matching",
	},
	argTypes: {
		jobType: {
			options: ["Matching", "Trainable D2DB", "Trainable D2D", "Camera"],
			control: { type: "inline-radio" },
		},
	},
};
