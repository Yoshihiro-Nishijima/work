import type { Meta, StoryObj } from "@storybook/react";
import { type ComponentProps, useEffect, useState } from "react";

import { useImportedParam } from "~/features/recipe/hooks/mocks/useImportedParam.mock";
import type { FlatDesignLayer } from "~/features/recipe/types";

import { OffsetXY } from "../../imported";

type Props = ComponentProps<typeof OffsetXY> & {
	offsetX: number | undefined;
	offsetY: number | undefined;
	isReadonly: boolean;
};

const OffsetXYMock = (props: Props): JSX.Element => {
	const [offsetX, setOffsetX] = useState(props.offsetX);
	const [offsetY, setOffsetY] = useState(props.offsetY);

	useImportedParam.mockReturnValue({
		designData: "",
		cellName: "",
		offsetX,
		offsetY,
		designLayers: [],
		designLayerIDs: [],
		designLayerTypes: [],
		setDesignData: (
			valOrUpdater:
				| ((currVal: string | undefined) => string | undefined)
				| string
				| undefined,
		) => ({}),
		setCellName: (
			valOrUpdater:
				| ((currVal: string | undefined) => string | undefined)
				| string
				| undefined,
		) => ({}),
		setOffsetX,
		setOffsetY,
		setDesignLayers: (
			valOrUpdater:
				| ((currVal: FlatDesignLayer[]) => FlatDesignLayer[])
				| FlatDesignLayer[],
		) => ({}),
	});

	useEffect(() => {
		setOffsetX(props.offsetX);
	}, [props.offsetX]);

	useEffect(() => {
		setOffsetY(props.offsetY);
	}, [props.offsetY]);

	return <OffsetXY isReadonly={props.isReadonly} />;
};

const meta = {
	component: OffsetXYMock,
} satisfies Meta<typeof OffsetXYMock>;

export default meta;
type Story = StoryObj<typeof OffsetXYMock>;

export const Default: Story = {
	args: {
		offsetX: 0,
		offsetY: 0,
		isReadonly: false,
	},
	argTypes: {
		offsetX: {
			control: { type: "number", step: 0.001 },
			description: "-300000～300000",
		},
		offsetY: {
			control: { type: "number", step: 0.001 },
			description: "-300000～300000",
		},
	},
};
