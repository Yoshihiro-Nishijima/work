import type { Meta, StoryObj } from "@storybook/react";
import { type ComponentProps, useEffect, useState } from "react";

import {
	useInspectionParam,
	useSetInspectionParam,
} from "~/features/recipe/hooks/mocks/useInspectionParam.mock";
import { useJobType } from "~/features/recipe/hooks/mocks/useRecipeCommonParam.mock";
import { useSegmentation } from "~/features/recipe/hooks/mocks/useSegmentation.mock";
import type { InspectionParam, RangeValue } from "~/features/recipe/types";

import type { JobType } from "../../../types/CommonParam";
import { SegmentationSetting } from "../../inspection";

type Props = ComponentProps<typeof SegmentationSetting> & {
	jobType: JobType;
	model: string;
	numberOfSegments: number;
	segSensitivity: number[];
};

const SegmentationSettingMock = (props: Props): JSX.Element => {
	const [segSensitivity, setSegSensitivity] = useState(props.segSensitivity);

	useInspectionParam.mockReturnValue({
		matchingDownscaleFactor: 3,
		algolithmVersion: 2,
		featureAngles: [0.0, 45.0, 90.0, 135.0],
		model: props.model,
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
		clippingFov: 0,
		layerFilter: [""],
		layerEnabled: true,
		layerCoverage: 0,
		layerOverlap: 1,
		segSensitivity,
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
		setGrouping: (value: boolean) => ({}),
		setAbnormality: (value: number) => ({}),
		setDistance: (value: number | undefined) => ({}),
		setWidth: (value: RangeValue) => ({}),
		setHeight: (value: RangeValue) => ({}),
		setGrayscale: (value: RangeValue) => ({}),
		setGrayscaleDiff: (value: RangeValue) => ({}),
		setClippingFov: (value: number) => ({}),
		setLayerFilter: (
			valOrUpdater: ((currVal: string[]) => string[]) | string[],
		) => ({}),
		setSegSensitivity,
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

	useSegmentation.mockReturnValue({
		numberOfSegments: props.numberOfSegments,
		sensitivity: [],
		exec: false,
	});

	useJobType.mockReturnValue(props.jobType);

	useEffect(() => {
		setSegSensitivity(props.segSensitivity);
	}, [props.segSensitivity]);

	return <SegmentationSetting />;
};

const meta = {
	component: SegmentationSettingMock,
} satisfies Meta<typeof SegmentationSetting>;
export default meta;
type Story = StoryObj<typeof SegmentationSettingMock>;

export const Default: Story = {
	args: {
		jobType: "Trainable D2D",
		model: "ModelA",
		numberOfSegments: 20,
		segSensitivity: [
			1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
		],
	},
	argTypes: {
		jobType: {
			description: "Trainable D2D 以外の場合は，本コンポーネント非表示",
			options: ["Matching", "Trainable D2DB", "Trainable D2D", "Camera"],
			control: { type: "inline-radio" },
		},
		model: {
			description: "空文字の場合は、VIEW SEGMENTATIONボタン押下不可",
		},
		numberOfSegments: {
			description: "0 の場合は、本コンポーネント非表示",
		},
	},
};
