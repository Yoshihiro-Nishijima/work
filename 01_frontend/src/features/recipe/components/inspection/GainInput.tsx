import {
	useInspectionParam,
	useSetInspectionParam,
} from "~/features/recipe/hooks/useInspectionParam";
import { useJobType } from "~/features/recipe/hooks/useRecipeCommonParam";

import { LabeledNumberInput } from "..";

export const PositiveGainInput = (): JSX.Element | undefined => {
	const { positiveGain } = useInspectionParam();
	const { setPositiveGain } = useSetInspectionParam();
	const jobType = useJobType();

	if (!["Trainable D2D", "C2C", "D2D"].includes(jobType)) return undefined;

	return (
		<LabeledNumberInput
			label="Positive Gain [%]"
			num={positiveGain}
			setNum={setPositiveGain}
			min={0}
			max={1000}
		/>
	);
};

export const NegativeGainInput = (): JSX.Element | undefined => {
	const { negativeGain } = useInspectionParam();
	const { setNegativeGain } = useSetInspectionParam();
	const jobType = useJobType();

	if (!["Trainable D2D", "C2C", "D2D"].includes(jobType)) return undefined;

	return (
		<LabeledNumberInput
			label="Negative Gain [%]"
			num={negativeGain}
			setNum={setNegativeGain}
			min={0}
			max={1000}
		/>
	);
};
