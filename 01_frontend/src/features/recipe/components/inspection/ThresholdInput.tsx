import {
	useInspectionParam,
	useSetInspectionParam,
} from "~/features/recipe/hooks/useInspectionParam";

import { LabeledNumberInput } from "..";

export const ThresholdInput = (): JSX.Element => {
	const { threshold } = useInspectionParam();
	const { setThreshold } = useSetInspectionParam();
	return (
		<LabeledNumberInput
			label="Threshold"
			num={threshold}
			setNum={setThreshold}
			max={100.0}
			min={0.0}
			step={0.1}
			decimalPlaces={1}
		/>
	);
};
