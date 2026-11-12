import type { Meta, StoryObj } from "@storybook/react";
import { type ComponentProps, useEffect, useState } from "react";

import {
	useInspectionParam,
	useSetInspectionParam,
} from "~/features/recipe/hooks/mocks/useInspectionParam.mock";
import type { InspectionParam, RangeValue } from "~/features/recipe/types";

import { ClippingSetting } from "../../inspection";

type Props = ComponentProps<typeof ClippingSetting> & {
	clippingFov: number;
};

const ClippingSettingMock = (props: Props): JSX.Element => {
	const [clippingFov, setClippingFov] = useState(props.clippingFov);
	useInspectionParam.mockReturnValue({
		model: "",
		threshold: 0,
		toleranceDistance: 0,
		positiveGain: 0,
		negativeGain: 0,
		grouping: true,
		distance: 0,
		abnormality: 0,
		defectFilter: [],
		width: { min: 0, max: 100 },
		height: { min: 0, max: 100 },
		grayscale: { min: 0, max: 100 },
		grayscaleDiff: { min: 0, max: 100 },
		clippingFov,
		layerFilter: [""],
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
		matchingDownscaleFactor: 0,
		algolithmVersion: 0,
		featureAngles: [],
		layerEnabled: false,
		layerCoverage: 0,
		layerOverlap: 1,
	});

	useSetInspectionParam.mockReturnValue({
		setInspectionParam: (stvaluer: InspectionParam) => ({}),
		setModel: (value: string) => ({}),
		setThreshold: (value: number) => ({}),
		setToleranceDistance: (value: number) => ({}),
		setPositiveGain: (value: number) => ({}),
		setNegativeGain: (value: number) => ({}),
		setGrouping: (value: boolean) => ({}),
		setAbnormality: (value: number) => ({}),
		setDistance: (value: number | undefined) => ({}),
		setWidth: (value: RangeValue) => ({}),
		setHeight: (value: RangeValue) => ({}),
		setGrayscale: (value: RangeValue) => ({}),
		setGrayscaleDiff: (value: RangeValue) => ({}),
		setClippingFov,
		setLayerFilter: (
			valOrUpdater: ((currVal: string[]) => string[]) | string[],
		) => ({}),
		setSegSensitivity: (value: number[]) => ({}),
		setBlockSize: (value: number) => ({}),
		setBlur: (value: boolean) => ({}),
		setBrightnessContrastCorrection: (value: boolean) => ({}),
		setClipLimit: (value: number) => ({}),
		setSearchArea: (value: number) => ({}),
		setSigmaColor: (value: number) => ({}),
		setSigmaSpace: (value: number) => ({}),
		setZoom: (value: boolean) => ({}),
		setZoomRatio: (value: number) => ({}),
		setMatchingDownscaleFactor: (value: number) => ({}),
		setAlgolithmVersion: (value: number) => ({}),
		setFeatureAngles: (value: number[]) => ({}),
		setLayerEnabled: (value: boolean) => ({}),
		setLayerCoverage: (value: number) => ({}),
		setLayerOverlap: (value: number) => ({}),
	});

	useEffect(() => {
		setClippingFov(props.clippingFov);
	}, [props.clippingFov]);

	return <ClippingSetting />;
};

const meta = {
	component: ClippingSettingMock,
} satisfies Meta<typeof ClippingSetting>;

export default meta;
type Story = StoryObj<typeof ClippingSettingMock>;

export const Default: Story = {
	args: {
		clippingFov: 0.135,
	},
	argTypes: {
		clippingFov: {
			control: { type: "number", step: 0.001 },
			description: "0.135～3.000",
		},
	},
};
