import type { ErrorMessage } from "~/components/types/ErrorMessageType";
import type { ReExecuteParam } from "../types";
import { validateAdc } from "./validateAdc";
import { validateDesign } from "./validateDesign";
import { validateInspection } from "./validateInspection";
import { validateMatching } from "./validateMatching";
import { validateUpload } from "./validateUpload";

export const fetchAndValidateReExecuteParam = async (
	param: ReExecuteParam,
	modeTabIdxes: number[],
	fetchUploadServers: () => Promise<string[]>,
	fetchDesignDataList: () => Promise<string[]>,
	fetchModels: () => Promise<string[]>,
	fetchAdcModels: () => Promise<string[]>,
): Promise<ErrorMessage> => {
	const [uploadServers, designDataList, models, adcModels] = await Promise.all([
		fetchUploadServers(),
		fetchDesignDataList(),
		fetchModels(),
		fetchAdcModels(),
	]);

	return validateReExecuteParam(
		param,
		modeTabIdxes,
		uploadServers,
		designDataList,
		models,
		adcModels,
	);
};

export const validateReExecuteParam = (
	param: ReExecuteParam,
	modeTabIdxes: number[],
	uploadServers: string[],
	designDataList: string[],
	models: string[],
	adcModels: string[],
): ErrorMessage => {
	const errors: ErrorMessage = [];
	errors.push(...validateUpload(param.common.upload, uploadServers));
	errors.push(...validateDesign(param.common.design, designDataList));

	for (let i = 0; i < param.modes.length; i++) {
		const { mode } = param.modes[i];
		if (modeTabIdxes.includes(1) && mode.matching) {
			const matchingErrors = validateMatching(
				mode.matching,
				param.common.design,
			);
			for (const err of matchingErrors) {
				err.loc = ["modes", i, "mode", ...(err.loc ?? [])];
				errors.push(err);
			}
		}

		if (modeTabIdxes.includes(2) && mode.inspection) {
			const inspectionErrors = validateInspection(
				mode.inspection,
				param.common.jobType,
				models,
				param.common.design,
			);
			for (const err of inspectionErrors) {
				err.loc = ["modes", i, "mode", ...(err.loc ?? [])];
				errors.push(err);
			}
		}

		if (modeTabIdxes.includes(3) && mode.adc) {
			const adcErrors = validateAdc(mode.adc, adcModels);
			for (const err of adcErrors) {
				err.loc = ["modes", i, "mode", ...(err.loc ?? [])];
				errors.push(err);
			}
		}
	}

	return errors;
};
