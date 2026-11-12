import type { ErrorMessage } from "~/components/types/ErrorMessageType";
import type {
	DefectFilter,
	Design,
	DesignLayer,
	Detection,
	InspectionParam,
	JobType,
} from "../types";

export const validateInspection = (
	inspection: InspectionParam,
	jobType: JobType,
	models: string[],
	design: Design,
): ErrorMessage => {
	const errors: ErrorMessage = [];

	errors.push(...validateDetection(inspection.detection, jobType, models));

	if (design.enabled && design.designType === "Imported") {
		errors.push(
			...validateDefectFilterLayers(
				inspection.defectFilters,
				design.designLayer ?? [],
			),
		);
	}
	return errors;
};

/**
 * Detectionに対して以下を検証する。
 *
 * - jobTypeが"Trainable D2D","Trainable D2DB"の場合に、modelがmodelsに含まれるか。
 */
const validateDetection = (
	detection: Detection,
	jobType: string,
	models: string[],
): ErrorMessage => {
	const errors: ErrorMessage = [];

	switch (jobType) {
		case "Matching":
		case "D2D":
		case "C2C":
		case "Camera":
			return errors;
		case "Trainable D2DB":
		case "Trainable D2D":
			if (!models.includes(detection.model)) {
				errors.push({
					loc: ["inspection", "detection", "model"],
					msg: `${detection.model} is not in ${models.join(",")}.`,
					type: "value_error",
				});
			}
			break;
	}

	return errors;
};

/**
 * DefectFilter-Layer対して以下を検証する。
 *
 * - Design Layer / LayerIDにない値が設定されていないか
 */
const validateDefectFilterLayers = (
	defectFilters: DefectFilter[],
	designLayer: DesignLayer[],
): ErrorMessage => {
	const errors: ErrorMessage = [];

	const layerIds = new Set(
		designLayer.map((d) => d.layerID).filter((id) => id != null),
	);

	let defectIdx = -1;
	for (const filter of defectFilters) {
		defectIdx++;
		if (filter.layer.length === 0) continue;
		// layerIdに含まれていないものを抽出
		const notIncludesLayerIds = filter.layer.filter((id) => !layerIds.has(id));
		if (notIncludesLayerIds.length === 0) continue;
		errors.push({
			loc: ["inspection", "Defect Filter Setting", defectIdx, "Layer"],
			msg: `${notIncludesLayerIds.join(", ")} is not in Design Layer IDs.`,
			type: "value_error",
		});
	}
	return errors;
};
