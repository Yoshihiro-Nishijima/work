import { useAtomValue } from "jotai";
import { useState } from "react";

import {
	type ErrorMessage,
	isErrorMessage,
} from "~/components/types/ErrorMessageType";

import { useDefectDisplay } from "~/features/display-setting/hooks/useDefectDisplay";
import type { DefectDisplayRow } from "~/features/display-setting/types";
import { extractApiErrorInfo } from "~/lib/extractApiErrorMessage";
import { postReExecute } from "../api/postReExecute";
import type { ReExecuteParam, RecipeModeParam } from "../types";
import { fetchAndValidateReExecuteParam } from "../validators/validateReExecuteParam";
import { useADCModels } from "./useADCModels";
import { adcSelector } from "./useADCParam";
import { correctionSelector } from "./useCorrectionParam";
import { useCustomParam } from "./useCustomParam";
import { useDesignDataList, useImportedDesign } from "./useImportedParam";
import { inspectionSelector } from "./useInspectionParam";
import { matchingSelector } from "./useMatchingParam";
import { useModels } from "./useModels";
import {
	useExecuteRecipeCommonParam,
	useRecipeCommonParams,
} from "./useRecipeCommonParam";
import { useRecipeModeParam } from "./useRecipeModeParam";
import { useUploadServers } from "./useUploadServers";

interface UseReExecute {
	isExecuting: boolean;
	isSuccess: boolean;
	errorMessage?: ErrorMessage | string;
	doReExecute: () => () => void;
}

const locationConvertMap: Record<string, string> = {
	// 共通パラメータ
	body: "",
	common: "",
	fileID: "fileID",
	version: "version",
	jobType: "JobType",
	revision: "revision",
	comment: "Comment",
	design: "DesignType",
	// Imported
	Imported: "Imported",
	offsetX: "Offset for Design Coordinate X",
	offsetY: "Offset for Design Coordinate Y",
	cellName: "Cell Name",
	designData: "Design Data",
	designLayer: "Design Layer",
	layerID: "Layer ID",
	layers: "",
	dataType: "Data Type",
	filterDilationX: "Filter Dilation X",
	filterDilationY: "Filter Dilation Y",
	layerNo: "Layer No",
	process: "Process",
	tone: "Tone",
	type: "Type",
	// Custom
	Custom: "Custom",
	manualLayout: "",
	"V-Line": "V-Line",
	pitchX: "Pitch X",
	Hole: "Hole",
	pitchY: "Pitch Y",
	shiftX: "Shift X",
	shiftY: "Shift Y",
	sizeX: "Size X",
	sizeY: "Size Y",
	// Upload
	upload: "Upload",
	defectImages: "Defect Images",
	enabled: "enabled",
	server: "Server",
	umMarker: "µmMarker",

	// モード別パラメータ
	modes: "Area",
	no: "no",
	mode: "",

	// ADC
	adc: "ADC",
	model: "Model",
	uploadClasses: "Upload Classes",
	// CORRECTION
	correction: "CORRECTION",
	correctionMagX: "Correction Magnification X",
	correctionMagY: "Correction Magnification Y",
	correctionRotation: "CorrectionRotation",
	digitalABCC: "Digital ABCC",
	brightnessBias: "Brightness Bias",
	contrastGain: "Contrast Gain",
	downscalingFactor: "Downscaling Factor",
	highlights: "Highlights",
	midtones: "Midtones",
	percentileThreshold: "Percentile Threshold",
	shadows: "Shadows",
	// INSPECTION
	inspection: "INSPECTION",
	clipping: "Clipping Setting",
	fov: "FOV",
	defectFilters: "Defect Filter Setting",
	abnormality: "Abnormality",
	grayscale: "Grayscale",
	grayscaleDiff: "Grayscale Diff",
	height: "Height",
	layer: "Layer",
	width: "Width",
	defectGroup: "Defect Group Setting",
	distance: "Distance",
	detection: "Detection Setting",
	negativeGain: "Negative Gain",
	positiveGain: "Positive Gain",
	searchArea: "Search Area",
	threshold: "Threshold",
	toleranceDistance: "Tolerance Distance",
	preprocessing: "Preprocessing",
	blockSize: "Block Size",
	blur: "Blur",
	brightnessContrastCorrection: "Brightness Contrast Correction",
	clipLimit: "Clip Limit",
	sigmaColor: "Sigma Color",
	sigmaSpace: "Sigma Space",
	zoom: "Zoom",
	zoomRatio: "Ratio",
	segSensitivity: "Segmentation Setting Sensitivity",
	// MATCHING
	matching: "MATCHING",
	alignmentMode: "Alignment Mode",
	erosionMitigation: "Erosion Mitigation",
	layerType: "Layer Type",
	matchingArea: "Matching Area",
	reductionRatio: "Reduction Ratio",
};

/**
 * エラー位置を人が見て理解できる文字列に変換
 */
export const formatErrorLocation = (
	errorMessage: ErrorMessage,
	postedData: ReExecuteParam,
	defectDisplayRowList: DefectDisplayRow[],
): ErrorMessage => {
	const convertedDetails = errorMessage.map((message, i) => {
		const convertedLoc = message.loc.map((item, index) => {
			if (typeof item === "number") {
				return convertIndexToKey(
					message.loc,
					index,
					postedData,
					defectDisplayRowList,
				);
			}
			if (typeof item === "string") {
				return convertName(item);
			}
			return "";
		});
		return {
			...message,
			loc: convertedLoc,
		};
	});
	return convertedDetails;
};

/**
 * 配列のインデックスをキー情報に変換
 */
function convertIndexToKey(
	loc: (string | number)[],
	i: number,
	postedData: ReExecuteParam,
	defectDisplayRowList: DefectDisplayRow[],
): string {
	const index = loc[i] as number;
	const indexStr = `[${index}]`;
	if (i < 1) return indexStr;
	// modes配列インデックス → AreaNo
	if (loc[i - 1] === "modes") {
		const areaNo = postedData.modes[index]?.no ?? "(unknown)";
		return `${areaNo}`;
	}

	// Upload配列インデックス → Upload1/2
	if (loc[i - 1] === "upload") {
		return `${index + 1}`;
	}

	// designLayer配列インデックス → LayerID
	if (loc[i - 1] === "designLayer") {
		const layerID =
			postedData.common.design.designLayer?.[index]?.layerID ?? "unknown";
		return `(Layer ID:${layerID})`;
	}

	// defectFilters配列インデックス → Defect Display Color
	if (loc[i - 1] === "defectFilters") {
		return defectDisplayRowList.length > index
			? `${defectDisplayRowList[index].name}`
			: "Color(unknown)";
	}

	// layers配列インデックス → LayerNo
	if (i < 2) return `[${index}]`;
	if (loc[i - 1] === "layers" && typeof loc[i - 2] === "number") {
		const layerID = loc[i - 2] as number;
		const layerNo =
			postedData.common.design.designLayer?.[layerID]?.layers[index].layerNo ??
			"unknown";
		return `(Layer No:${layerNo})`;
	}

	// キー情報が無い場合、[]付きで表記する
	return indexStr;
}

/**
 * 項目名を変換
 */
function convertName(name: string): string {
	// 辞書に存在する場合はその値を返す
	if (name in locationConvertMap) {
		return locationConvertMap[name];
	}

	return name;
}

export const useReExecute = (): UseReExecute => {
	const {
		jobName,
		jobType,
		numDefects,
		commonBase,
		designEnabled,
		designType,
		outputDesignBasedDefectCoords,
		uploadParam0,
		uploadParam1,
	} = useExecuteRecipeCommonParam();
	const { modeTabIdxes } = useRecipeCommonParams();

	const { designData, cellName, offsetX, offsetY, designLayer } =
		useImportedDesign();
	const { customDesign } = useCustomParam();

	const { editAreaNos, modeBase } = useRecipeModeParam();
	const { defectDisplayRowList } = useDefectDisplay();

	const matchings = useAtomValue(matchingSelector);
	const inspections = useAtomValue(inspectionSelector);
	const adcs = useAtomValue(adcSelector);
	const corrections = useAtomValue(correctionSelector);

	const [isExecuting, setIsExecuting] = useState(false);
	const [isSuccess, setIsSuccess] = useState(false);
	const [errorMessage, setErrorMessage] = useState<ErrorMessage | string>();

	const { fetchUploadServers } = useUploadServers();
	const { fetchDesignDataList } = useDesignDataList();
	const { fetchModels } = useModels(jobType);
	const { fetchAdcModels } = useADCModels();

	const createReExecuteParam = (): ReExecuteParam => {
		// Common Params
		const design = (() => {
			return {
				enabled: designEnabled,
				designType,
				designData,
				cellName,
				offsetX,
				offsetY,
				designLayer,
				manualLayout: customDesign.manualLayout,
			};
		})();
		const modes = editAreaNos.map((areaNo) => {
			return {
				no: areaNo,
				mode: {
					fileID: modeBase.fileID,
					version: modeBase.version,
					revision: modeBase.revision,
					comment: modeBase.comment,
					matching: matchings?.get(areaNo),
					inspection: inspections?.get(areaNo),
					adc: adcs?.get(areaNo),
					correction: corrections?.get(areaNo),
				} satisfies RecipeModeParam,
			};
		});

		return {
			common: {
				fileID: commonBase.fileID,
				version: commonBase.version,
				revision: commonBase.revision,
				comment: commonBase.comment,
				jobType,
				numDefects,
				design,
				outputDesignBasedDefectCoords,
				upload: [uploadParam0, uploadParam1],
			},
			modes,
		};
	};

	const doReExecute = (): (() => void) => {
		return async () => {
			const postData = createReExecuteParam();
			const controller = new AbortController();

			setIsSuccess(false);
			setIsExecuting(true);
			setErrorMessage(undefined);

			try {
				const errorMessageList = await fetchAndValidateReExecuteParam(
					postData,
					modeTabIdxes,
					fetchUploadServers,
					fetchDesignDataList,
					fetchModels,
					fetchAdcModels,
				);

				if (errorMessageList.length > 0) {
					setErrorMessage(
						formatErrorLocation(
							errorMessageList,
							postData,
							defectDisplayRowList,
						),
					);
					return;
				}

				await postReExecute(jobName, postData, controller.signal);
				setIsSuccess(true);
			} catch (error) {
				const info = await extractApiErrorInfo(error);
				if (info.aborted) return undefined;
				console.log({ info });
				if (info.message == null) {
					console.error("postReExecute fail.", error);
					setErrorMessage("postReExecute fail.");
					return;
				}
				try {
					const msg = JSON.parse(info.message);
					if (isErrorMessage(msg)) {
						// バリデーションエラーの場合
						setErrorMessage(
							formatErrorLocation(msg, postData, defectDisplayRowList),
						);
					} else {
						setErrorMessage(info.message);
					}
				} catch {
					setErrorMessage(info.message);
				}
			} finally {
				setIsExecuting(false);
			}
		};
	};
	return { isExecuting, isSuccess, errorMessage, doReExecute };
};
