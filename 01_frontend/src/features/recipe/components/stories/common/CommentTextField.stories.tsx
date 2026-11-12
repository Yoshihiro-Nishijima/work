import type { Meta, StoryObj } from "@storybook/react";
import { type ComponentProps, useEffect, useState } from "react";

import { useRecipeCommonParams } from "~/features/recipe/hooks/mocks/useRecipeCommonParam.mock";

import { CommentTextField } from "../../common";

type Props = ComponentProps<typeof CommentTextField> & {
	comment: string;
};
const CommentTextFieldMock = (props: Props): JSX.Element => {
	const [comment, setComment] = useState(props.comment);

	useRecipeCommonParams.mockReturnValue({
		jobType: "Matching",
		numDefects: 100,
		designType: "Imported",
		outputDesignBasedDefectCoords: false,
		uploadParam0: {},
		uploadParam1: {},
		comment,
		commonBase: { fileID: "", version: 1, revision: 0, comment: "" },
		jobName: "",
		enableImported: false,
		modeTabIdxes: [],
		setJobType: (value) => {},
		setNumDefects(value) {},
		setOutputDesignBasedDefectCoords(value) {},
		setUploadParam0: (value) => {},
		setUploadParam1: (value) => {},
		setComment,
		setDesignType: (value) => {},
	});

	useEffect(() => {
		setComment(props.comment);
	}, [props.comment]);

	return <CommentTextField />;
};

const meta = {
	component: CommentTextFieldMock,
} satisfies Meta<typeof CommentTextField>;

export default meta;
type Story = StoryObj<typeof CommentTextFieldMock>;

export const Default: Story = {
	args: {
		comment: "",
	},
};
