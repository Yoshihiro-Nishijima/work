import { XYSetting } from "~/components/elements/XYSetting";
import { useCustomParam } from "~/features/recipe/hooks/useCustomParam";

import type { IsReadonlyProp } from "../../types";

export const PitchXY = ({
	isReadonly = false,
}: IsReadonlyProp): JSX.Element => {
	const { pitchX, pitchY, setPitchX, setPitchY, enableLayoutX, enableLayoutY } =
		useCustomParam();
	return (
		<XYSetting
			legend="Pitch"
			x={pitchX ?? 0}
			y={pitchY ?? 0}
			setX={setPitchX}
			setY={setPitchY}
			labelX="X [nm]"
			labelY="Y [nm]"
			min={0.01}
			max={1000.0}
			step={0.001}
			disabledX={isReadonly || !enableLayoutX}
			disabledY={isReadonly || !enableLayoutY}
			decimalPlaces={3}
		/>
	);
};
