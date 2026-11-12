import type { Meta, StoryObj } from "@storybook/react";
import { type ComponentProps, useEffect, useState } from "react";

import { useImportedParam } from "~/features/recipe/hooks/mocks/useImportedParam.mock";

import type { FlatDesignLayer } from "../../../types";
import { DesignLayerDataGrid } from "../../imported";

type Props = ComponentProps<typeof DesignLayerDataGrid> & {
	isTestRun: boolean;
	designLayers: FlatDesignLayer[];
};

const DesignLayerDataGridMock = (props: Props): JSX.Element => {
	const [designLayers, setDesignLayers] = useState(props.designLayers);

	useImportedParam.mockReturnValue({
		designData: "",
		cellName: "",
		offsetX: 0,
		offsetY: 0,
		designLayers,
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
		setOffsetX: (
			valOrUpdater:
				| ((currVal: number | undefined) => number | undefined)
				| number
				| undefined,
		) => ({}),
		setOffsetY: (
			valOrUpdater:
				| ((currVal: number | undefined) => number | undefined)
				| number
				| undefined,
		) => ({}),
		setDesignLayers,
	});

	useEffect(() => {
		setDesignLayers(props.designLayers);
	}, [props.designLayers]);

	return <DesignLayerDataGrid isTestRun={props.isTestRun} />;
};

const meta = {
	component: DesignLayerDataGridMock,
} satisfies Meta<typeof DesignLayerDataGridMock>;

export default meta;
type Story = StoryObj<typeof DesignLayerDataGridMock>;

export const Default: Story = {
	args: {
		isTestRun: false,
		designLayers: [
			{
				layerID: 1,
				type: "Target",
				tone: "Clear",
				process: "Normal",
				layerNo: 1,
				dataType: 1,
				id: 1,
				parentID: 1,
				filterDilationX: 1,
				filterDilationY: 1,
			},
		],
	},
};
