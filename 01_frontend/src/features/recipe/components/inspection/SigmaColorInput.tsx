import { LabeledNumberInput } from "..";
import { useInspectionParam, useSetInspectionParam } from "../../hooks";

export const SigmaColorInput = (): JSX.Element => {
	const { sigmaColor, blur } = useInspectionParam();
	const { setSigmaColor } = useSetInspectionParam();
	return (
		<LabeledNumberInput
			label="Sigma Color"
			num={sigmaColor}
			setNum={setSigmaColor}
			max={100}
			min={1}
			step={1}
			disabled={!blur}
		/>
	);
};
