import type { Meta, StoryObj } from "@storybook/react";
import { type ComponentProps, useEffect, useState } from "react";

import { useDefectDisplay } from "~/features/display-setting/hooks/mocks/useDefectDisplay.mock";
import { useImportedParam } from "~/features/recipe/hooks/mocks/useImportedParam.mock";
import {
	useInspectionParam,
	useSetInspectionParam,
} from "~/features/recipe/hooks/mocks/useInspectionParam.mock";
import { useRecipeCommonParams } from "~/features/recipe/hooks/mocks/useRecipeCommonParam.mock";
import type {
	FlatDesignLayer,
	InspectionParam,
	RangeValue,
} from "~/features/recipe/types";

import type { DefectDisplayRow } from "../../../../display-setting/types";
import { DefectFilterSetting } from "../../inspection";

type Props = ComponentProps<typeof DefectFilterSetting> & {
	defectDisplayRowList: DefectDisplayRow[];
	selectedDefectDisplayNo: number;
	abnormality: number;
	width: RangeValue;
	height: RangeValue;
	grayscale: RangeValue;
	grayscaleDiff: RangeValue;
	layerFilter: string[];
	designLayerIDs: number[];
	enableLayerID: boolean;
};

const DefectFilterSettingMock = (props: Props): JSX.Element => {
	const [selectedDefectDisplayNo, setSelectedDefectDisplayNo] = useState(
		props.selectedDefectDisplayNo,
	);
	const [abnormality, setAbnormality] = useState(props.abnormality);
	const [width, setWidth] = useState(props.width);
	const [height, setHeight] = useState(props.height);
	const [grayscale, setGrayscale] = useState(props.grayscale);
	const [grayscaleDiff, setGrayscaleDiff] = useState(props.grayscaleDiff);
	const [layerFilter, setLayerFilter] = useState(props.layerFilter);

	useDefectDisplay.mockReturnValue({
		defectDisplayRowList: props.defectDisplayRowList,
		selectedDefectDisplayNo,
		setSelectedDefectDisplayNo,
		formatCaughtBy: (_: number | null | undefined) => "",
	});

	useImportedParam.mockReturnValue({
		designData: "",
		cellName: "",
		offsetX: 0,
		offsetY: 0,
		designLayers: [],
		designLayerIDs: props.designLayerIDs,
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
		setDesignLayers: (
			valOrUpdater:
				| ((currVal: FlatDesignLayer[]) => FlatDesignLayer[])
				| FlatDesignLayer[],
		) => ({}),
	});

	useInspectionParam.mockReturnValue({
		matchingDownscaleFactor: 3,
		algolithmVersion: 2,
		featureAngles: [0.0, 45.0, 90.0, 135.0],
		model: "str",
		threshold: 0,
		toleranceDistance: 0,
		positiveGain: 0,
		negativeGain: 0,
		grouping: true,
		distance: 0,
		abnormality,
		defectFilter: [],
		width,
		height,
		grayscale,
		grayscaleDiff,
		clippingFov: 0,
		layerFilter,
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
		setGrouping: (value: boolean) => ({}),
		setAbnormality,
		setDistance: (value: number | undefined) => ({}),
		setWidth,
		setHeight,
		setGrayscale,
		setGrayscaleDiff,
		setClippingFov: (value: number) => ({}),
		setLayerFilter,
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

	useRecipeCommonParams.mockReturnValue({
		jobType: "Matching",
		numDefects: 100,
		designType: "Imported",
		outputDesignBasedDefectCoords: false,
		uploadParam0: {},
		uploadParam1: {},
		comment: "",
		commonBase: { fileID: "", version: 1, revision: 0, comment: "" },
		jobName: "",
		enableImported: false,
		modeTabIdxes: [],
		setJobType: (value) => {},
		setNumDefects(value) {},
		setOutputDesignBasedDefectCoords(value) {},
		setUploadParam0: (value) => {},
		setUploadParam1: (value) => {},
		setComment: (value) => {},
		setDesignType: (value) => {},
	});

	useEffect(() => {
		setSelectedDefectDisplayNo(props.selectedDefectDisplayNo);
	}, [props.selectedDefectDisplayNo]);

	useEffect(() => {
		setAbnormality(props.abnormality);
	}, [props.abnormality]);

	useEffect(() => {
		setWidth(props.width);
	}, [props.width]);

	useEffect(() => {
		setHeight(props.height);
	}, [props.height]);

	useEffect(() => {
		setGrayscale(props.grayscale);
	}, [props.grayscale]);

	useEffect(() => {
		setGrayscaleDiff(props.grayscaleDiff);
	}, [props.grayscaleDiff]);

	useEffect(() => {
		setLayerFilter(props.layerFilter);
	}, [props.layerFilter]);

	return <DefectFilterSetting />;
};

const meta = {
	component: DefectFilterSettingMock,
} satisfies Meta<typeof DefectFilterSetting>;

export default meta;
type Story = StoryObj<typeof DefectFilterSettingMock>;

export const Default: Story = {
	args: {
		defectDisplayRowList: [
			{
				name: "Black",
				color: "Black",
				filterNo: 1,
			},
			{
				name: "Red",
				color: "Red",
				filterNo: 2,
			},
			{
				name: "Green",
				color: "Green",
				filterNo: 3,
			},
			{
				name: "Blue",
				color: "Blue",
				filterNo: 4,
			},
			{
				name: "Orange",
				color: "Orange",
				filterNo: 5,
			},
			{
				name: "Purple",
				color: "Purple",
				filterNo: 6,
			},
			{
				name: "Gray",
				color: "Gray",
				filterNo: 7,
			},
			{
				name: "White",
				color: "White",
				filterNo: 8,
			},
		],
		selectedDefectDisplayNo: 0,
		abnormality: 10,
		width: { min: 0, max: 5000 },
		height: { min: 0, max: 5000 },
		grayscale: { min: 0, max: 100 },
		grayscaleDiff: { min: 0, max: 100 },
		layerFilter: ["1"],
		designLayerIDs: [1, 2, 3, 4, 5],
		enableLayerID: true,
	},
	argTypes: {
		abnormality: {
			control: { type: "number", step: 0.001 },
			description: "0～30",
		},
		width: {
			description: "0～12000",
		},
		height: {
			description: "0～12000",
		},
		grayscale: {
			description: "0～255",
		},
		grayscaleDiff: {
			description: "-255～255",
		},
	},
};
