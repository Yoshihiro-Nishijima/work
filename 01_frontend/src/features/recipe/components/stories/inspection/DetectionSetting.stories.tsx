import type { Meta, StoryObj } from "@storybook/react";
import { type ComponentProps, useEffect, useState } from "react";

import {
	useInspectionParam,
	useSetInspectionParam,
} from "~/features/recipe/hooks/mocks/useInspectionParam.mock";
import { useModels } from "~/features/recipe/hooks/mocks/useModels.mock";
import { useJobType } from "~/features/recipe/hooks/mocks/useRecipeCommonParam.mock";
import type { InspectionParam, RangeValue } from "~/features/recipe/types";

import { vi } from "vitest";
import type { JobType } from "../../../types/CommonParam";
import { DetectionSetting } from "../../inspection";

type Props = ComponentProps<typeof DetectionSetting> & {
	jobType: JobType;
	isModelReadonly: boolean;
	model: string;
	models: string[];
	threshold: number;
	toleranceDistance: number;
	positiveGain: number;
	negativeGain: number;
};

const DetectionSettingMock = (props: Props): JSX.Element => {
	const [model, setModel] = useState(props.model);
	const [threshold, setThreshold] = useState(props.threshold);
	const [toleranceDistance, setToleranceDistance] = useState(
		props.toleranceDistance,
	);
	const [positiveGain, setPositiveGain] = useState(props.positiveGain);
	const [negativeGain, setNegativeGain] = useState(props.negativeGain);

	useInspectionParam.mockReturnValue({
		matchingDownscaleFactor: 3,
		algolithmVersion: 2,
		featureAngles: [0.0, 45.0, 90.0, 135.0],
		model,
		threshold,
		toleranceDistance,
		positiveGain,
		negativeGain,
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
		setModel,
		setThreshold,
		setToleranceDistance,
		setPositiveGain,
		setNegativeGain,
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

	useModels.mockReturnValue({ models: props.models, fetchModels: vi.fn() });

	useJobType.mockReturnValue(props.jobType);

	useEffect(() => {
		setModel(props.model);
	}, [props.model]);

	useEffect(() => {
		setThreshold(props.threshold);
	}, [props.threshold]);

	useEffect(() => {
		setToleranceDistance(props.toleranceDistance);
	}, [props.toleranceDistance]);

	useEffect(() => {
		setPositiveGain(props.positiveGain);
	}, [props.positiveGain]);

	useEffect(() => {
		setNegativeGain(props.negativeGain);
	}, [props.negativeGain]);

	return <DetectionSetting isModelReadonly={props.isModelReadonly} />;
};

const meta = {
	component: DetectionSettingMock,
} satisfies Meta<typeof DetectionSettingMock>;

export default meta;
type Story = StoryObj<typeof DetectionSettingMock>;

export const Default: Story = {
	args: {
		jobType: "Trainable D2D",
		isModelReadonly: false,
		model: "ModelA",
		models: ["ModelA", "ModelB", "ModelC"],
		threshold: 0,
		toleranceDistance: 0,
		positiveGain: 0,
		negativeGain: 0,
	},
	argTypes: {
		jobType: {
			description:
				"Trainable D2D 以外の場合は、Positive Gain・Negative Gain非表示",
			options: ["Matching", "Trainable D2DB", "Trainable D2D", "Camera"],
			control: { type: "inline-radio" },
		},
		threshold: {
			control: { type: "number", step: 0.1 },
			description: "0～100",
		},
		toleranceDistance: {
			control: { type: "number", step: 0.1 },
			description: "0～5",
		},
		positiveGain: {
			description: "0～1000",
		},
		negativeGain: {
			description: "0～1000",
		},
	},
};
