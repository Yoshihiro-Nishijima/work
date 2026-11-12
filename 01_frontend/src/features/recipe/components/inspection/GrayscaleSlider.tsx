import {
	useInspectionParam,
	useSetInspectionParam,
} from "~/features/recipe/hooks/useInspectionParam";

import { LabeledRangeSlider } from "..";

export const GrayscaleSlider = (): JSX.Element => {
	const { grayscale } = useInspectionParam();
	const { setGrayscale } = useSetInspectionParam();

	return (
		<LabeledRangeSlider
			label="Grayscale"
			num={grayscale}
			setNum={setGrayscale}
			min={0}
			max={255}
			step={1}
		/>
	);
};
