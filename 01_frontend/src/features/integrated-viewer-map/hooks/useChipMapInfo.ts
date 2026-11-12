import { atom, useAtomValue } from "jotai";
import { loadable } from "jotai/utils";
import { idwSelector } from "~/features/map/hooks";
import {
	PADDING,
	integratedMapAreaHeightAtom,
	integratedMapAreaWidthAtom,
} from "./useMapAreaInfo";

export const DEFAULT_CHIPMAP_INFO: ChipMapInfo = {
	pixelSizeX: 0,
	pixelSizeY: 0,
	chipArrayCountX: 0,
	chipArrayCountY: 0,
	chipExist: [],
	scaleX: 1,
	scaleY: 1,
};

const chipMapInfoAtom = atom<Promise<ChipMapInfo>>(async (get) => {
	const idw = await get(idwSelector);
	if (idw == null) return DEFAULT_CHIPMAP_INFO;
	const waferPixelSize =
		Math.min(
			get(integratedMapAreaWidthAtom),
			get(integratedMapAreaHeightAtom),
		) - PADDING;
	const pixelSizeX = Math.floor(waferPixelSize / idw.chipArray.x);
	const pixelSizeY = Math.floor(waferPixelSize / idw.chipArray.y);
	return {
		pixelSizeX,
		pixelSizeY,
		chipArrayCountX: idw.chipArray.x,
		chipArrayCountY: idw.chipArray.y,
		chipExist: idw.chipExist,
		scaleX: idw.chipPitch.x === 0 ? 0 : pixelSizeX / idw.chipPitch.x,
		scaleY: idw.chipPitch.y === 0 ? 0 : pixelSizeY / idw.chipPitch.y,
	};
});
const chipMapInfoLoadableAtom = loadable(chipMapInfoAtom);

export interface ChipMapInfo {
	// 1chipの pixel数
	pixelSizeX: number;
	pixelSizeY: number;
	// X軸のchip数
	chipArrayCountX: number;
	// Y軸のchip数
	chipArrayCountY: number;
	// chip有無
	chipExist: string[];
	// FOV座標との変換倍率 Fov座標の値を ViewPortの world座標に変換する際に使用
	scaleX: number;
	scaleY: number;
}
interface UseChipMapInfo {
	chipMapInfo: ChipMapInfo;
}

export const useChipMapInfo = (): UseChipMapInfo => {
	const chipMapInfoLoadable = useAtomValue(chipMapInfoLoadableAtom);
	return {
		chipMapInfo:
			chipMapInfoLoadable.state === "hasData"
				? chipMapInfoLoadable.data
				: DEFAULT_CHIPMAP_INFO,
	};
};
