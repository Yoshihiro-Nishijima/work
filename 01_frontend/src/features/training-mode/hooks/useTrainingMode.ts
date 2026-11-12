import { atom, useAtom } from "jotai";
import { type Dispatch, type SetStateAction, useEffect } from "react";
import {
	useMapInfo,
	useWaferMapInfo,
} from "~/features/integrated-viewer-map/hooks/useMapInfo";
import {
	MAP_SCALE_TABLE,
	TRAINING_MODE_MAP_MIN_OPERATION_SCALE,
	useMapSliderInfo,
} from "~/features/integrated-viewer-map/hooks/useMapSliderInfo";

/* TrainingMode表示状態管理 */
const isTragningModeAtom = atom(false);

export interface UseTrainingMode {
	isTrainingMode: boolean;
	setTrainingMode: Dispatch<SetStateAction<boolean>>;
}

export const useTrainingMode = (): UseTrainingMode => {
	const [isTrainingMode, setTrainingMode] = useAtom(isTragningModeAtom);
	const { setMapOperationScale } = useMapSliderInfo();
	const { setScale } = useMapInfo();
	const { enabledWaferColorMap } = useWaferMapInfo();

	// TrainingMode有効時にWaferMap表示だった場合はMap表示倍率を変更
	useEffect(() => {
		if (!isTrainingMode || !enabledWaferColorMap) return;
		// ViewPort上のscale
		setScale(MAP_SCALE_TABLE[TRAINING_MODE_MAP_MIN_OPERATION_SCALE - 1]);
		// Slider管理のScale
		setMapOperationScale(TRAINING_MODE_MAP_MIN_OPERATION_SCALE);
	}, [isTrainingMode, enabledWaferColorMap, setScale, setMapOperationScale]);

	return { isTrainingMode, setTrainingMode };
};
