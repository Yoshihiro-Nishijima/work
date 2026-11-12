import type { Meta, StoryObj } from "@storybook/react";
import { type ComponentProps, useEffect, useState } from "react";

import {
	useCorrectionParam,
	useSetCorrectionParam,
} from "~/features/recipe/hooks/mocks/useCorrectionParam.mock";

import { CorrectionRotation } from "../../correction";

type Props = ComponentProps<typeof CorrectionRotation> & {
	correctionRotation: number;
};

const CorrectionRotationMock = (props: Props): JSX.Element => {
	const [correctionRotation, setCorrectionRotation] = useState(
		props.correctionRotation,
	);

	useCorrectionParam.mockReturnValue({
		correctionMagX: 0,
		correctionMagY: 0,
		correctionRotation,
	});

	useSetCorrectionParam.mockReturnValue({
		setCorrectionParam: (value) => {},
		setCorrectionMagX: (value) => {},
		setCorrectionMagY: (value) => {},
		setCorrectionRotation,
	});

	useEffect(() => {
		setCorrectionRotation(props.correctionRotation);
	}, [props.correctionRotation]);

	return <CorrectionRotation />;
};

const meta = {
	component: CorrectionRotationMock,
} satisfies Meta<typeof CorrectionRotation>;

export default meta;
type Story = StoryObj<typeof CorrectionRotationMock>;

export const Default: Story = {
	args: {
		correctionRotation: 0,
	},
	argTypes: {
		correctionRotation: {
			control: { type: "number", step: 0.001 },
			description: "-190～190",
		},
	},
};
