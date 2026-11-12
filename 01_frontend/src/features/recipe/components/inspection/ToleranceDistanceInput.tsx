import {
	useInspectionParam,
	useSetInspectionParam,
} from "~/features/recipe/hooks/useInspectionParam";

import { LabeledNumberInput } from "..";

export const ToleranceDistanceInput = (): JSX.Element => {
	const { toleranceDistance } = useInspectionParam();
	const { setToleranceDistance } = useSetInspectionParam();
	return (
		<LabeledNumberInput
			label="Tolerance Distance"
			num={toleranceDistance}
			setNum={setToleranceDistance}
			min={0.0}
			max={5.0}
			step={0.1}
			decimalPlaces={1}
		/>
	);
};
