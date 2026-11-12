import type { ErrorMessage } from "~/components/types/ErrorMessageType";
import type { Design, DesignLayer, LayerType } from "../types";

const MAX_LAYER_COUNT = 9;

export const validateDesign = (
	design: Design,
	designDatas: string[],
): ErrorMessage => {
	const errors: ErrorMessage = [];

	if (design.enabled && design.designType === "Imported") {
		errors.push(...validateDesignLayer(design.designLayer ?? []));
		errors.push(...validateDesignData(design.designData ?? "", designDatas));
	}
	return errors;
};

/**
 * designData がdesignDatasに含まれているかを検証する。
 */
export const validateDesignData = (
	designData: string,
	designDatas: string[],
): ErrorMessage => {
	const errors: ErrorMessage = [];

	if (!designDatas.includes(designData)) {
		errors.push({
			loc: ["design", "designData"],
			msg: `${designData} is not in ${designDatas.join(",")}.`,
			type: "value_error",
		});
	}

	return errors;
};

/**
 * DesignLayerに対して以下を検証する。
 *
 * - 各LayerTypeの最初のprocessが"Normal"であること。
 * - LayerNoとDataTypeの組み合わせが重複していないこと。
 * - 各LayerTypeの件数が 上限件数を超過しているか
 */
export const validateDesignLayer = (
	designLayers: DesignLayer[],
): ErrorMessage => {
	const errors: ErrorMessage = [];

	const layerTypeCounts: Record<string, number> = {};
	const layerCombinations = new Set<string>();
	const types = new Set<LayerType>();

	designLayers.forEach((designLayer, designLayerIndex) => {
		const type = designLayer.type;
		const process = designLayer.process;

		if (type) {
			// LayerType 件数
			layerTypeCounts[type] = (layerTypeCounts[type] || 0) + 1;

			// Typeごとの先頭DesignLayerのProcessがNormalかチェック
			if (!types.has(type)) {
				types.add(type);
				if (process !== "Normal") {
					errors.push({
						loc: ["design", "designLayer", designLayerIndex],
						msg: `The first DesignLayer of type ${type} must have Process=Normal.`,
						type: "value_error",
					});
				}
			}
		}

		// LayerNo + DataType 重複チェック
		designLayer.layers.forEach((layer, layerIndex) => {
			const key = `${layer.layerNo}-${layer.dataType}`;
			if (layerCombinations.has(key)) {
				errors.push({
					loc: [
						"design",
						"designLayer",
						designLayerIndex,
						"layers",
						layerIndex,
					],
					msg: `Duplicate LayerNo/DataType combination found: LayerNo=${layer.layerNo}, DataType=${layer.dataType}.`,
					type: "value_error",
				});
			} else {
				layerCombinations.add(key);
			}
		});
	});

	// LayerType 件数チェック
	for (const [type, count] of Object.entries(layerTypeCounts)) {
		if (count > MAX_LAYER_COUNT) {
			errors.push({
				loc: ["design", "designLayer"],
				msg: `Too many layers of type ${type}. Maximum allowed is ${MAX_LAYER_COUNT}.`,
				type: "value_error",
			});
		}
	}

	return errors;
};
