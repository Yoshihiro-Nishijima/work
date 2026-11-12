import {
	useInspectionParam,
	useSetInspectionParam,
} from "~/features/recipe/hooks/useInspectionParam";

import { LabeledSlider } from "..";

export const AbnormalitySlider = (): JSX.Element => {
	const { abnormality } = useInspectionParam();
	const { setAbnormality } = useSetInspectionParam();

	return (
		<LabeledSlider
			label="Abnormality"
			num={abnormality}
			setNum={setAbnormality}
			min={0.0}
			max={30}
			step={0.001}
			decimalPlaces={3}
		/>
	);
};
