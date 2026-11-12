import type { Meta, StoryObj } from "@storybook/react";

import { useAreaNos } from "~/features/recipe/hooks/mocks/useAreaNos.mock";

import { AreaList } from "../../area";

interface AreaListMockProps {
	areaNos: number[];
}

const AreaListMock = (props: AreaListMockProps): JSX.Element => {
	useAreaNos.mockReturnValue({
		areaNos: props.areaNos,
		loading: false,
	});
	return <AreaList />;
};

const meta = {
	component: AreaListMock,
} satisfies Meta<typeof AreaList>;

export default meta;
type Story = StoryObj<typeof AreaListMock>;

export const Default: Story = {
	args: {
		areaNos: [1, 2, 3, 4, 5],
	},
};
