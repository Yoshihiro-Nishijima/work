import type { Meta, StoryObj } from "@storybook/react";
import { type ComponentProps, useEffect, useState } from "react";

import {
	useCorrectionParam,
	useSetCorrectionParam,
} from "~/features/recipe/hooks/mocks/useCorrectionParam.mock";

import { CorrectionMagXY } from "../../correction";

type Props = ComponentProps<typeof CorrectionMagXY> & {
	correctionMagX: number;
	correctionMagY: number;
};

const CorrectionMagXYMock = (props: Props): JSX.Element => {
	const [correctionMagX, setCorrectionMagX] = useState(props.correctionMagX);
	const [correctionMagY, setCorrectionMagY] = useState(props.correctionMagY);

	useCorrectionParam.mockReturnValue({
		correctionMagX,
		correctionMagY,
		correctionRotation: 0,
	});

	useSetCorrectionParam.mockReturnValue({
		setCorrectionParam: (value) => {},
		setCorrectionMagX,
		setCorrectionMagY,
		setCorrectionRotation: (value) => {},
	});

	useEffect(() => {
		setCorrectionMagX(props.correctionMagX);
	}, [props.correctionMagX]);

	useEffect(() => {
		setCorrectionMagY(props.correctionMagY);
	}, [props.correctionMagY]);

	return <CorrectionMagXY />;
};

const meta = {
	component: CorrectionMagXYMock,
} satisfies Meta<typeof CorrectionMagXY>;

export default meta;
type Story = StoryObj<typeof CorrectionMagXYMock>;

export const Default: Story = {
	args: {
		correctionMagX: 1.0000000001,
		correctionMagY: 1.0000000001,
	},
	argTypes: {
		correctionMagX: {
			control: { type: "number", step: 0.0000000001 },
			description: "0.5～1.5",
		},
		correctionMagY: {
			control: { type: "number", step: 0.0000000001 },
			description: "0.5～1.5",
		},
	},
};
