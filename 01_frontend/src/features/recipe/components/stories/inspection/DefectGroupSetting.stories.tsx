import type { Meta, StoryObj } from "@storybook/react";
import { type ComponentProps, useEffect, useState } from "react";

import {
	useInspectionParam,
	useSetInspectionParam,
} from "~/features/recipe/hooks/mocks/useInspectionParam.mock";
import type { InspectionParam, RangeValue } from "~/features/recipe/types";

import { DefectGroupSetting } from "../../inspection";

type Props = ComponentProps<typeof DefectGroupSetting> & {
	grouping: boolean;
	distance: number | undefined;
};

const DefectGroupSettingMock = (props: Props): JSX.Element => {
	const [grouping, setGrouping] = useState(props.grouping);
	const [distance, setDistance] = useState(props.distance);

	useInspectionParam.mockReturnValue({
		matchingDownscaleFactor: 3,
		algolithmVersion: 2,
		featureAngles: [0.0, 45.0, 90.0, 135.0],
		model: "",
		threshold: 0,
		toleranceDistance: 0,
		positiveGain: 0,
		negativeGain: 0,
		grouping,
		distance,
		abnormality: 0,
		defectFilter: [],
		width: { min: 0, max: 100 },
		height: { min: 0, max: 100 },
		grayscale: { min: 0, max: 100 },
		grayscaleDiff: { min: 0, max: 100 },
		clippingFov: 0,
		layerFilter: [""],
		layerEnabled: true,
		layerCoverage: 0,
		layerOverlap: 1,
		segSensitivity: [0],
		blockSize: 0,
		blur: false,
		brightnessContrastCorrection: false,
		clipLimit: 0,
		searchArea: 0,
		sigmaColor: 0,
		sigmaSpace: 0,
		zoom: false,
		zoomRatio: 0,
	});

	useSetInspectionParam.mockReturnValue({
		setInspectionParam: (stvaluer: InspectionParam) => ({}),
		setModel: (value: string) => ({}),
		setThreshold: (value: number) => ({}),
		setToleranceDistance: (value: number) => ({}),
		setPositiveGain: (value: number) => ({}),
		setNegativeGain: (value: number) => ({}),
		setGrouping,
		setAbnormality: (value: number) => ({}),
		setDistance,
		setWidth: (value: RangeValue) => ({}),
		setHeight: (value: RangeValue) => ({}),
		setGrayscale: (value: RangeValue) => ({}),
		setGrayscaleDiff: (value: RangeValue) => ({}),
		setClippingFov: (value: number) => ({}),
		setLayerFilter: (
			valOrUpdater: ((currVal: string[]) => string[]) | string[],
		) => ({}),
		setSegSensitivity: (value: number[]) => ({}),
		setBlockSize: (value: number) => ({}),
		setBlur: (value: boolean) => ({}),
		setBrightnessContrastCorrection: (value: boolean) => ({}),
		setClipLimit: (value: number) => ({}),
		setSearchArea: (value: number) => ({}),
		setMatchingDownscaleFactor: (value: number) => ({}),
		setAlgolithmVersion: (value: number) => ({}),
		setFeatureAngles: (value: number[]) => ({}),
		setLayerEnabled: (value: boolean) => ({}),
		setLayerCoverage: (value: number) => ({}),
		setLayerOverlap: (value: number) => ({}),
		setSigmaColor: (value: number) => ({}),
		setSigmaSpace: (value: number) => ({}),
		setZoom: (value: boolean) => ({}),
		setZoomRatio: (value: number) => ({}),
	});

	useEffect(() => {
		setGrouping(props.grouping);
	}, [props.grouping]);

	useEffect(() => {
		setDistance(props.distance);
	}, [props.distance]);

	return <DefectGroupSetting />;
};

const meta = {
	component: DefectGroupSettingMock,
} satisfies Meta<typeof DefectGroupSetting>;

export default meta;
type Story = StoryObj<typeof DefectGroupSettingMock>;

export const Default: Story = {
	args: {
		grouping: true,
		distance: 0,
	},
	argTypes: {
		distance: {
			control: { type: "number", step: 0.1 },
			description: "0～100000",
		},
	},
};
