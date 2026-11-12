import type { ErrorMessage } from "~/components/types/ErrorMessageType";
import type {
	Design,
	DesignLayer,
	MatchingLayerType,
	MatchingParam,
} from "../types";

export const validateMatching = (
	matching: MatchingParam,
	design: Design,
): ErrorMessage => {
	const errors: ErrorMessage = [];

	if (design.enabled && design.designType === "Imported") {
		errors.push(
			...validateLayerType(matching.layerType, design.designLayer ?? []),
		);
	}
	return errors;
};

/**
 * LayerTypeに対して以下を検証する。
 *
 * - Design Layer / Typeにない値が設定されていないか
 */
const validateLayerType = (
	layerType: MatchingLayerType,
	designLayer: DesignLayer[],
): ErrorMessage => {
	const errors: ErrorMessage = [];

	if (layerType === "All") return errors;

	const designLayerTypes = designLayer
		.map((d) => d.type)
		.filter((t) => t != null);
	if (designLayerTypes.includes(layerType)) return errors;

	errors.push({
		loc: ["matching", "Layer Type"],
		msg: `${layerType} is not in ${designLayerTypes.join(", ")}.`,
		type: "value_error",
	});

	return errors;
};
