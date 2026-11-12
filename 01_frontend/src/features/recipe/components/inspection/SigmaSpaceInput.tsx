import { LabeledNumberInput } from "..";
import { useInspectionParam, useSetInspectionParam } from "../../hooks";

export const SigmaSpaceInput = (): JSX.Element => {
	const { sigmaSpace, blur } = useInspectionParam();
	const { setSigmaSpace } = useSetInspectionParam();
	return (
		<LabeledNumberInput
			label="Sigma Space"
			num={sigmaSpace}
			setNum={setSigmaSpace}
			max={4}
			min={1}
			step={1}
			disabled={!blur}
		/>
	);
};
