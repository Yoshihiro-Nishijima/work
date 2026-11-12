import type { ErrorMessage } from "~/components/types/ErrorMessageType";
import type { ADCParam } from "../types";

/**
 * enablesがtrueの場合に、modelがadcModelsに含まれていることを検証する。
 */
export const validateAdc = (
	adc: ADCParam,
	adcModels: string[],
): ErrorMessage => {
	const errors: ErrorMessage = [];

	if (!adc.enabled || adcModels.includes(adc.model)) return errors;

	errors.push({
		loc: ["adc", "model"],
		msg: `${adc.model} is not in ${adcModels.join(",")}.`,
		type: "value_error",
	});
	return errors;
};
