import { atom, useAtom, useAtomValue } from "jotai";
import {
	type Dispatch,
	type SetStateAction,
	useCallback,
	useEffect,
} from "react";

import { getDesigns } from "../api/getDesigns";
import type { Design, FlatDesignLayer, LayerType } from "../types";
import { toDesignLayers } from "../types/converter";

const designDataAtom = atom<string | undefined>(undefined);
const cellNameAtom = atom<string | undefined>(undefined);
const offsetXAtom = atom<number | undefined>(undefined);
const offsetYAtom = atom<number | undefined>(undefined);
const designLayersAtom = atom<FlatDesignLayer[]>([]);

const designDataListAtom = atom<string[]>([]);

const designLayerIDsSelector = atom((get) =>
	Array.from(
		new Set(
			get(designLayersAtom)
				.map((v) => v.layerID)
				.filter((layerID) => layerID != null),
		),
	),
);

const designLayerTypesSelector = atom((get) =>
	Array.from(
		new Set(
			get(designLayersAtom)
				.map((v) => v.type)
				.filter((type) => type != null),
		),
	),
);

export interface UseImportedParam {
	designData?: string;
	cellName?: string;
	offsetX?: number;
	offsetY?: number;
	designLayers: FlatDesignLayer[];
	designLayerIDs: number[];
	designLayerTypes: LayerType[];
	setDesignData: Dispatch<SetStateAction<string | undefined>>;
	setCellName: Dispatch<SetStateAction<string | undefined>>;
	setOffsetX: Dispatch<SetStateAction<number | undefined>>;
	setOffsetY: Dispatch<SetStateAction<number | undefined>>;
	setDesignLayers: Dispatch<SetStateAction<FlatDesignLayer[]>>;
}

export const useImportedParam = (): UseImportedParam => {
	const [designData, setDesignData] = useAtom(designDataAtom);
	const [cellName, setCellName] = useAtom(cellNameAtom);
	const [offsetX, setOffsetX] = useAtom(offsetXAtom);
	const [offsetY, setOffsetY] = useAtom(offsetYAtom);
	const [designLayers, setDesignLayers] = useAtom(designLayersAtom);
	const designLayerIDs = useAtomValue(designLayerIDsSelector);
	const designLayerTypes = useAtomValue(designLayerTypesSelector);

	return {
		designData,
		cellName,
		offsetX,
		offsetY,
		designLayers,
		designLayerIDs,
		designLayerTypes,
		setDesignData,
		setCellName,
		setOffsetX,
		setOffsetY,
		setDesignLayers,
	};
};

export interface UseDesignDataList {
	designDataList: string[];
	fetchDesignDataList: () => Promise<string[]>;
}

export const useDesignDataList = (): UseDesignDataList => {
	const [designDataList, setDesignDataList] = useAtom(designDataListAtom);

	const fetchDesignDataList = useCallback(async (): Promise<string[]> => {
		try {
			const controller = new AbortController();
			const res = await getDesigns(controller.signal);
			setDesignDataList(res);
			return res;
		} catch (error) {
			console.error("fetchDesignDataList failed.", error);
			setDesignDataList([]);
			return [];
		}
	}, [setDesignDataList]);

	useEffect(() => {
		void fetchDesignDataList();
	}, [fetchDesignDataList]);

	return { designDataList, fetchDesignDataList };
};

export const useImportedDesign = (): Omit<Design, "enabled"> => {
	const designData = useAtomValue(designDataAtom);
	const cellName = useAtomValue(cellNameAtom);
	const offsetX = useAtomValue(offsetXAtom);
	const offsetY = useAtomValue(offsetYAtom);
	const designLayers = useAtomValue(designLayersAtom);

	return {
		designType: "Imported",
		designData,
		cellName,
		offsetX,
		offsetY,
		designLayer: toDesignLayers(designLayers),
	};
};
