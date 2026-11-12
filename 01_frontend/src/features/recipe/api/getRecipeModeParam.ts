import { ky } from "lib/ky";
import merge from "lodash.merge";

import type { ADCParam, RecipeModeParam } from "../types";

const getBaseRecipeModeParam = (): RecipeModeParam => {
	return {
		fileID: "MB-MMI-Mode",
		version: 1,
		revision: 1,
		comment: "",
		matching: {
			layerType: "All",
			searchArea: 96,
			matchingArea: "Original",
			matchingMethod: "Grad-DL",
			erosionMitigation: "Off",
			alignmentMode: "Auto",
			reductionRatio: "1/1",
		},
		inspection: {
			preprocessing: {
				brightnessContrastCorrection: false,
				clipLimit: 2,
				blockSize: 256,
				blur: false,
				sigmaColor: 8,
				sigmaSpace: 1,
				zoom: false,
				zoomRatio: 1.0,
			},
			detection: {
				model: "",
				threshold: 3.0,
				toleranceDistance: 1.0,
				positiveGain: 100,
				negativeGain: 100,
				searchArea: 0,
				matchingDownscaleFactor: 3,
				algorithmVersion: 1,
			},
			defectFeatureExtraction: {
				featureAngles: [0.0, 45.0, 90.0, 135.0],
			},
			defectGroup: {
				grouping: false,
				distance: 10,
			},
			defectFilters: [
				{
					abnormality: 0.0,
					width: {
						min: 0.0,
						max: 12000.0,
					},
					height: {
						min: 0.0,
						max: 12000.0,
					},
					grayscale: {
						min: 0,
						max: 255,
					},
					grayscaleDiff: {
						min: -255,
						max: 255,
					},
					layer: [],
					layerCoverage: 0,
					layerOverlap: 1,
				},
				{
					abnormality: 30.0,
					width: {
						min: 0.0,
						max: 12000.0,
					},
					height: {
						min: 0.0,
						max: 12000.0,
					},
					grayscale: {
						min: 0,
						max: 255,
					},
					grayscaleDiff: {
						min: -255,
						max: 255,
					},
					layer: [],
					layerCoverage: 0,
					layerOverlap: 1,
				},
				{
					abnormality: 30.0,
					width: {
						min: 0.0,
						max: 12000.0,
					},
					height: {
						min: 0.0,
						max: 12000.0,
					},
					grayscale: {
						min: 0,
						max: 255,
					},
					grayscaleDiff: {
						min: -255,
						max: 255,
					},
					layer: [],
					layerCoverage: 0,
					layerOverlap: 1,
				},
				{
					abnormality: 30.0,
					width: {
						min: 0.0,
						max: 12000.0,
					},
					height: {
						min: 0.0,
						max: 12000.0,
					},
					grayscale: {
						min: 0,
						max: 255,
					},
					grayscaleDiff: {
						min: -255,
						max: 255,
					},
					layer: [],
					layerCoverage: 0,
					layerOverlap: 1,
				},
				{
					abnormality: 30.0,
					width: {
						min: 0.0,
						max: 12000.0,
					},
					height: {
						min: 0.0,
						max: 12000.0,
					},
					grayscale: {
						min: 0,
						max: 255,
					},
					grayscaleDiff: {
						min: -255,
						max: 255,
					},
					layer: [],
					layerCoverage: 0,
					layerOverlap: 1,
				},
				{
					abnormality: 30.0,
					width: {
						min: 0.0,
						max: 12000.0,
					},
					height: {
						min: 0.0,
						max: 12000.0,
					},
					grayscale: {
						min: 0,
						max: 255,
					},
					grayscaleDiff: {
						min: -255,
						max: 255,
					},
					layer: [],
					layerCoverage: 0,
					layerOverlap: 1,
				},
				{
					abnormality: 30.0,
					width: {
						min: 0.0,
						max: 12000.0,
					},
					height: {
						min: 0.0,
						max: 12000.0,
					},
					grayscale: {
						min: 0,
						max: 255,
					},
					grayscaleDiff: {
						min: -255,
						max: 255,
					},
					layer: [],
					layerCoverage: 0,
					layerOverlap: 1,
				},
				{
					abnormality: 30.0,
					width: {
						min: 0.0,
						max: 12000.0,
					},
					height: {
						min: 0.0,
						max: 12000.0,
					},
					grayscale: {
						min: 0,
						max: 255,
					},
					grayscaleDiff: {
						min: -255,
						max: 255,
					},
					layer: [],
					layerCoverage: 0,
					layerOverlap: 1,
				},
			],
			clipping: {
				fov: 1.024,
			},
			segSensitivity: [],
		},
		adc: {
			enabled: false,
			model: "",
			uploadClasses: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
		},
		correction: {
			correctionMagX: 1.0,
			correctionMagY: 1.0,
			correctionRotation: 0.0,
			digitalABCC: {
				enabled: false,
				method: "Deep Curve Estimation",
				percentileThreshold: 0,
				downscalingFactor: 8,
				contrastGain: 1.5,
				brightnessBias: 0,
				shadows: 0,
				midtones: 128,
				highlights: 255,
			},
		},
	};
};

export const getRecipeModeParam = async (
	jobName: string,
	areaNo: number,
	signal: AbortSignal,
): Promise<RecipeModeParam> => {
	const mode = await ky
		.get(`results/${jobName}/recipe/modes/${areaNo}`, { signal })
		.json();

	ensureADCCompatibility(mode);

	return mergeDefault(mode);
};

export const mergeDefault = (mode: unknown): RecipeModeParam => {
	const base = getBaseRecipeModeParam();

	if (mode instanceof Object) {
		(mode as Record<"version", unknown>).version = undefined;
		(mode as Record<"revision", unknown>).revision = undefined;

		if (mode instanceof Object && "adc" in mode) {
			const adc = mode.adc;

			if (
				adc instanceof Object &&
				"uploadClasses" in adc &&
				Array.isArray(adc.uploadClasses)
			) {
				(base as { adc: ADCParam }).adc.uploadClasses =
					adc.uploadClasses.filter((v) => typeof v === "number");
				adc.uploadClasses = undefined;
			}
		}
	}

	return merge(base, mode);
};

export const ensureADCCompatibility = (mode: unknown): void => {
	if (!(mode instanceof Object)) return;
	if ("adc" in mode) return;

	if (!("inspection" in mode)) return;
	const inspection = mode.inspection;

	if (!(inspection instanceof Object)) return;
	if (!("detection" in inspection)) return;
	const detection = inspection.detection;

	if (!(detection instanceof Object)) return;

	const adc: { [key: string]: unknown } = {};

	if ("adc" in detection && typeof detection.adc === "boolean") {
		adc.enabled = detection.adc;
		detection.adc = undefined;
	}

	if ("adcModel" in detection && typeof detection.adcModel === "string") {
		adc.model = detection.adcModel;
		detection.adcModel = undefined;
	}

	(mode as typeof mode & Record<"adc", unknown>).adc = adc;
};
