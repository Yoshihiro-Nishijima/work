import { LabeledNumberInput } from "..";
import { useInspectionParam, useSetInspectionParam } from "../../hooks";

export const ZoomRatioInput = (): JSX.Element => {
	const { zoomRatio, zoom } = useInspectionParam();
	const { setZoomRatio } = useSetInspectionParam();
	return (
		<LabeledNumberInput
			label="Ratio"
			num={zoomRatio}
			setNum={setZoomRatio}
			max={5.0}
			min={0.1}
			step={0.1}
			decimalPlaces={1}
			disabled={!zoom}
		/>
	);
};
