import { LabeledNumberInput } from "..";
import { useInspectionParam, useSetInspectionParam } from "../../hooks";

export const OverlapInput = (): JSX.Element => {
	const { layerOverlap, layerEnabled, layerFilter } = useInspectionParam();
	const { setLayerOverlap } = useSetInspectionParam();
	return (
		<LabeledNumberInput
			label="Overlap [pix]"
			num={layerOverlap}
			setNum={setLayerOverlap}
			max={1000}
			min={1}
			step={1}
			labelXs={3}
			disabled={!layerEnabled || layerFilter.length === 0}
		/>
	);
};
