import {
	useInspectionParam,
	useSetInspectionParam,
} from "~/features/recipe/hooks/useInspectionParam";

import { LabeledRangeSlider } from "..";

export const GrayscaleDiffSlider = (): JSX.Element => {
	const { grayscaleDiff } = useInspectionParam();
	const { setGrayscaleDiff } = useSetInspectionParam();

	return (
		<LabeledRangeSlider
			label="Grayscale Diff"
			num={grayscaleDiff}
			setNum={setGrayscaleDiff}
			min={-255}
			max={255}
			step={1}
		/>
	);
};
