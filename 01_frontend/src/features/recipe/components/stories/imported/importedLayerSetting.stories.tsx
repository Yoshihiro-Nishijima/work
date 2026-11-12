import type { Meta, StoryObj } from "@storybook/react";
import { type ComponentProps, useEffect, useState } from "react";

import {
	useDesignDataList,
	useImportedParam,
} from "~/features/recipe/hooks/mocks/useImportedParam.mock";
import type { FlatDesignLayer } from "~/features/recipe/types";

import { vi } from "vitest";
import { ImportedLayerSetting } from "../../imported";

type Props = ComponentProps<typeof ImportedLayerSetting> & {
	designData: string | undefined;
	cellName: string | undefined;
	isReadonly: boolean;
	designDataList: string[];
};

const ImportedLayerSettingMock = (props: Props): JSX.Element => {
	const [designData, setDesignData] = useState(props.designData);
	const [cellName, setCellName] = useState(props.cellName);

	useImportedParam.mockReturnValue({
		designData,
		cellName,
		offsetX: 0,
		offsetY: 0,
		designLayers: [],
		designLayerIDs: [],
		designLayerTypes: [],
		setDesignData,
		setCellName,
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
		setDesignLayers: (
			valOrUpdater:
				| ((currVal: FlatDesignLayer[]) => FlatDesignLayer[])
				| FlatDesignLayer[],
		) => ({}),
	});

	useDesignDataList.mockReturnValue({
		designDataList: props.designDataList,
		fetchDesignDataList: vi.fn(),
	});

	useEffect(() => {
		setDesignData(props.designData);
	}, [props.designData]);

	useEffect(() => {
		setCellName(props.cellName);
	}, [props.cellName]);

	return <ImportedLayerSetting isReadonly={props.isReadonly} />;
};

const meta = {
	component: ImportedLayerSettingMock,
} satisfies Meta<typeof ImportedLayerSettingMock>;

export default meta;
type Story = StoryObj<typeof ImportedLayerSettingMock>;

export const Default: Story = {
	args: {
		designData: "DesignA",
		cellName: "",
		isReadonly: false,
		designDataList: ["DesignA", "DesignB", "DesignC"],
	},
};
