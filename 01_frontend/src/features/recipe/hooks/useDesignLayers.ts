import { useEffect, useState } from "react";

import type { FlatDesignLayer } from "../types";

import { useImportedParam } from "./useImportedParam";
import {
	useInspectionParam,
	useSetInspectionParam,
} from "./useInspectionParam";

const createLayer = (
	id: number,
	layerID: number,
	src?: FlatDesignLayer,
): FlatDesignLayer => {
	// コピー元が指定されていたらIDだけ書き換える
	if (src != null) return { ...src, id };
	return {
		id,
		layerID,
		type: "Target",
		tone: "Clear",
		process: "Normal",
		layerNo: 0,
		dataType: 0,
		filterDilationX: 0,
		filterDilationY: 0,
	};
};

const createLayerNo = (
	id: number,
	parent: FlatDesignLayer,
): FlatDesignLayer => {
	return {
		id,
		layerNo: parent.layerNo,
		dataType: parent.dataType,
		parentID: parent.parentID ?? parent.id,
		filterDilationX: parent.filterDilationX,
		filterDilationY: parent.filterDilationY,
	};
};

const isUpdateLayerID = (
	newRow: FlatDesignLayer,
	oldRow: FlatDesignLayer,
): boolean => {
	return (
		newRow.id === oldRow.id &&
		newRow.layerID != null &&
		newRow.layerID !== oldRow.layerID
	);
};

export interface UseDesignLayers {
	designLayers: FlatDesignLayer[];
	deletableLayerID: boolean;
	addableLayerNo: boolean;
	deletableLayerNo: boolean;
	setSelectedRow: (selectedRawID: number) => void;
	addLayer: () => void;
	addLayerNo: () => void;
	removeLayer: () => void;
	removeLayerNo: () => void;
	updateRow: (newRow: FlatDesignLayer, oldRow: FlatDesignLayer) => void;
}

export const useDesignLayers = (): UseDesignLayers => {
	const { designLayers, setDesignLayers } = useImportedParam();
	const [selectedLayer, setSelectedLayer] = useState<FlatDesignLayer>();
	const [deletableLayerID, setDeletableLayerID] = useState(false);
	const [addableLayerNo, setAddableLayerNo] = useState(false);
	const [deletableLayerNo, setDeletableLayerNo] = useState(false);
	const { setLayerFilter } = useSetInspectionParam();
	const { layerFilter } = useInspectionParam();

	let idCounter =
		designLayers.length > 0 ? Math.max(...designLayers.map((v) => v.id)) : 0;

	const setSelectedRow = (selectedRawID: number): void => {
		setSelectedLayer(designLayers.find((v) => v.id === selectedRawID));
		setDeletableLayerID(selectedLayer != null);
	};

	const addLayer = (): void => {
		idCounter += 1;
		if (selectedLayer == null) {
			// LayerIDの最大値を指定
			const nextLayerID =
				designLayers.length > 0
					? Math.max(...designLayers.map((d) => d.layerID ?? 0)) + 1
					: 1;
			setDesignLayers((prev) => [...prev, createLayer(idCounter, nextLayerID)]);
			return;
		}

		// 選択中であればコピーを追加
		const newLayers = [...designLayers];
		const idx = newLayers.findLastIndex(
			(v) =>
				v.id === selectedLayer.id ||
				v.parentID === selectedLayer.id ||
				(selectedLayer.parentID != null &&
					v.parentID === selectedLayer.parentID),
		);
		const parentLayer =
			selectedLayer.parentID == null
				? newLayers.find((l) => l.id === selectedLayer.id)
				: newLayers.find((l) => l.id === selectedLayer.parentID);
		newLayers.splice(
			idx + 1,
			0,
			createLayer(idCounter, parentLayer?.layerID ?? 0, parentLayer),
		);
		setDesignLayers(newLayers);
	};

	const removeLayer = (): void => {
		if (selectedLayer == null) return;
		setDesignLayers((prev) =>
			prev.filter(
				(v) =>
					// 選択したLayerIDに紐づいたものを全て削除
					(selectedLayer.parentID == null &&
						v.id !== selectedLayer.id &&
						v.parentID !== selectedLayer.id) ||
					// 選択したLayerNoの親LayerIDに紐づいたものを全て削除
					(selectedLayer.parentID != null &&
						v.id !== selectedLayer.parentID &&
						v.parentID !== selectedLayer.parentID),
			),
		);
		setSelectedLayer(undefined);
		// Inspection LayerFilter に含まれていたらそちらも削除
		setLayerFilter(
			layerFilter.filter((l) => Number(l) !== selectedLayer.layerID),
		);
	};

	const addLayerNo = (): void => {
		if (selectedLayer == null) return;
		const newLayers = [...designLayers];
		const idx = newLayers.findLastIndex(
			(v) => v.id === selectedLayer.id || v.parentID === selectedLayer.id,
		);
		idCounter += 1;
		// 選択後に値が更新されている場合があるので layersから取得したものを使用
		newLayers.splice(idx + 1, 0, createLayerNo(idCounter, newLayers[idx]));
		setDesignLayers(newLayers);
	};

	const removeLayerNo = (): void => {
		if (selectedLayer == null || selectedLayer.parentID == null) return;
		setDesignLayers(designLayers.filter((l) => l.id !== selectedLayer.id));
		setSelectedLayer(undefined);
	};

	const updateRow = (
		newRow: FlatDesignLayer,
		oldRow: FlatDesignLayer,
	): void => {
		if (isUpdateLayerID(newRow, oldRow)) {
			// LayerIDの更新であれば Inspection - Defect Filter - LayerIDを新しいものに更新
			if (oldRow.layerID != null && newRow.layerID != null) {
				setLayerFilter(
					layerFilter.map((id) =>
						Number(id) === oldRow.layerID
							? newRow.layerID != null
								? newRow.layerID.toString()
								: id
							: id,
					),
				);
			}
		}
		setDesignLayers((prev) =>
			prev.map((row) => (newRow.id === row.id ? newRow : row)),
		);
	};

	useEffect(() => {
		if (designLayers.length === 0) {
			setDeletableLayerID(false);
			setAddableLayerNo(false);
			setDeletableLayerNo(false);
			return;
		}
		if (selectedLayer != null) {
			setDeletableLayerID(true);
			setAddableLayerNo(true);
			setDeletableLayerNo(selectedLayer.parentID != null);
			return;
		}
		setDeletableLayerID(false);
		setAddableLayerNo(false);
		setDeletableLayerNo(false);
	}, [designLayers, selectedLayer]);

	return {
		designLayers,
		deletableLayerID,
		addableLayerNo,
		deletableLayerNo,
		setSelectedRow,
		addLayer,
		addLayerNo,
		removeLayer,
		removeLayerNo,
		updateRow,
	};
};
