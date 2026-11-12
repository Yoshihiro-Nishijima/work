import { LabeledNumberInput } from "..";
import { useInspectionParam, useSetInspectionParam } from "../../hooks";

export const CoverageInput = (): JSX.Element => {
	const { layerCoverage, layerEnabled, layerFilter } = useInspectionParam();
	const { setLayerCoverage: setCoverage } = useSetInspectionParam();
	return (
		<LabeledNumberInput
			label="Coverage [%]"
			num={layerCoverage}
			setNum={setCoverage}
			max={100}
			min={0}
			step={1}
			labelXs={3}
			disabled={!layerEnabled || layerFilter.length === 0}
		/>
	);
};
