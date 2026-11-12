import type { DesignLayer, FlatDesignLayer, Layer } from ".";

/**
 * DesignLayerリスト をコンポーネント表示用の FlatDesignLayerリストに変換
 * @param designLayers DesignLayerリスト
 * @returns FlatDesignLayerリスト
 */
export function toFlatDesignLayers(
	designLayers: DesignLayer[],
): FlatDesignLayer[] {
	let idCounter = -1;
	const flatLayers: FlatDesignLayer[] = [];
	for (const layer of designLayers) {
		let isParent = true;
		let parentID = idCounter;
		for (const layerNos of layer.layers) {
			idCounter += 1;
			// 2件目以降の LayerNo データは layerID等を表示しないので未定義にする
			const flatLayer: FlatDesignLayer = {
				id: idCounter,
				layerID: isParent ? layer.layerID : undefined,
				type: isParent ? layer.type : undefined,
				tone: isParent ? layer.tone : undefined,
				process: isParent ? layer.process : undefined,
				layerNo: layerNos.layerNo,
				dataType: layerNos.dataType,
				filterDilationX: layerNos.filterDilationX,
				filterDilationY: layerNos.filterDilationY,
				parentID: isParent ? undefined : parentID,
			};
			if (isParent) {
				parentID = idCounter;
				isParent = false;
			}
			flatLayers.push(flatLayer);
		}
	}
	return flatLayers;
}

export function toDesignLayers(flatLayers: FlatDesignLayer[]): DesignLayer[] {
	const designLayers: DesignLayer[] = [];
	// 親 Layer だけの DesignLayer配列を作る
	for (const flatLayer of flatLayers.filter((l) => l.layerID != null)) {
		const layers: Layer[] = [];
		layers.push({
			layerNo: flatLayer.layerNo,
			dataType: flatLayer.dataType,
			filterDilationX: flatLayer.filterDilationX,
			filterDilationY: flatLayer.filterDilationY,
		});
		// LayerIDに紐づく子Layerを取得して Layer をセット
		for (const childLayer of flatLayers.filter(
			(l) => l.parentID === flatLayer.id,
		)) {
			layers.push({
				layerNo: childLayer.layerNo,
				dataType: childLayer.dataType,
				filterDilationX: childLayer.filterDilationX,
				filterDilationY: childLayer.filterDilationY,
			});
		}
		// 親 Layer
		const designLayer: DesignLayer = {
			layerID: flatLayer.layerID,
			type: flatLayer.type,
			tone: flatLayer.tone,
			process: flatLayer.process,
			layers,
		};
		designLayers.push(designLayer);
	}
	return designLayers;
}

/**
 * 最大長以上の文字列を最大長で切り出す
 * @param str 文字列
 * @param maxLength 最大長
 * @returns  切り出した文字列
 */
export const ommitString = (str: string, maxLength = 40): string => {
	if (str.length === 0 || str.length <= maxLength) return str;
	return str.substring(0, maxLength < 0 ? 40 : maxLength);
};
