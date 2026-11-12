import {
	useInspectionParam,
	useSetInspectionParam,
} from "~/features/recipe/hooks/useInspectionParam";

import { LabeledRangeSlider } from "..";

export const WidthSlider = (): JSX.Element => {
	const { width } = useInspectionParam();
	const { setWidth } = useSetInspectionParam();
	return (
		<LabeledRangeSlider
			label="Width"
			num={width}
			setNum={setWidth}
			min={0}
			max={12000}
			step={1}
		/>
	);
};
