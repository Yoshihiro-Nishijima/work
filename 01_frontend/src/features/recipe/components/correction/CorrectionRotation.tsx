import {
	useCorrectionParam,
	useSetCorrectionParam,
} from "~/features/recipe/hooks/useCorrectionParam";

import { LabeledNumberInput } from "..";

export const CorrectionRotation = (): JSX.Element => {
	const { correctionRotation } = useCorrectionParam();
	const { setCorrectionRotation } = useSetCorrectionParam();

	return (
		/** 小数3桁固定 */
		<LabeledNumberInput
			label="CorrectionRotation"
			labelXs={6}
			num={correctionRotation}
			setNum={setCorrectionRotation}
			min={-190.0}
			max={190.0}
			step={0.001}
			decimalPlaces={8}
		/>
	);
};
