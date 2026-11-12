import { MagnificationSlider } from "~/components/elements/MagnificationSlider";

import { useMapInfo } from "../hooks/useMapInfo";
import {
	MAP_MAX_OPERATION_SCALE,
	MAP_MIN_OPERATION_SCALE,
	MAP_SCALE_TABLE,
	useMapSliderInfo,
} from "../hooks/useMapSliderInfo";

/** MAP SCALE_SLIDERの画面下端からの位置(px) */
export const SCALE_SLIDER_BOTTOM_HEIGHT = 50;
/** MAP SCALE_SLIDERの画面右端からの位置(px) */
export const SCALE_SLIDER_RIGHT_WIDTH = 40;

interface mapSliderProps {
	minScale?: number;
	maxScale?: number;
}
/**
 * Map Slider表示
 * @returns MapSliderコンポーネント
 */
export const MapSlider = ({
	minScale = MAP_MIN_OPERATION_SCALE,
	maxScale = MAP_MAX_OPERATION_SCALE,
}: mapSliderProps): JSX.Element => {
	const { setScale } = useMapInfo();
	const { mapOperationScale, setMapOperationScale } = useMapSliderInfo();

	/** Slider 設定初期値 */
	const incrementMagnification = 1;

	/**  Slider 操作時イベント */
	const handleChangeMapSlider = (
		event: Event,
		newValue: number | number[],
	): void => {
		// ViewPort上のscale
		setScale(
			MAP_SCALE_TABLE[(Array.isArray(newValue) ? newValue[0] : newValue) - 1],
		);
		// Slider管理のScale
		setMapOperationScale(Array.isArray(newValue) ? newValue[0] : newValue);
	};

	/** Slider +ボタンクリック時イベント */
	const handleOnClickMapSliderAdd = (
		event: React.MouseEvent<HTMLElement, MouseEvent>,
	): void => {
		if (mapOperationScale >= maxScale) return;

		// ViewPort上のscale
		setScale(MAP_SCALE_TABLE[mapOperationScale + incrementMagnification - 1]);
		// Slider管理のScale
		setMapOperationScale(mapOperationScale + incrementMagnification);
	};
	/**  Slider -ボタンクリック時イベント */
	const handleOnCkickMapSliderRemove = (
		event: React.MouseEvent<HTMLElement, MouseEvent>,
	): void => {
		if (mapOperationScale <= minScale) return;

		// ViewPort上のscale
		setScale(MAP_SCALE_TABLE[mapOperationScale - incrementMagnification - 1]);
		// Slider管理のScale
		setMapOperationScale(mapOperationScale - incrementMagnification);
	};
	/**  Sliderの表示位置調整 */
	const mpaSliderSx = {
		right: `${SCALE_SLIDER_RIGHT_WIDTH}px`,
		bottom: `${SCALE_SLIDER_BOTTOM_HEIGHT}px`,
	};

	return (
		<MagnificationSlider
			sx={mpaSliderSx}
			maxValue={MAP_MAX_OPERATION_SCALE}
			minValue={minScale}
			increment={incrementMagnification}
			magnification={mapOperationScale}
			displayValueFactor={1}
			strMagnificationSymbol="x"
			handleChangeSliderEvent={handleChangeMapSlider}
			handleOnClickAddEvent={handleOnClickMapSliderAdd}
			handleOnClickRemoveEvent={handleOnCkickMapSliderRemove}
		/>
	);
};
