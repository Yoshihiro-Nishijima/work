import {
	useInspectionParam,
	useSetInspectionParam,
} from "~/features/recipe/hooks/useInspectionParam";

import { LabeledRangeSlider } from "..";

export const HeightSlider = (): JSX.Element => {
	const { height } = useInspectionParam();
	const { setHeight } = useSetInspectionParam();
	return (
		<LabeledRangeSlider
			label="Height"
			num={height}
			setNum={setHeight}
			min={0}
			max={12000}
			step={1}
		/>
	);
};
