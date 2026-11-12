import { XYSetting } from "~/components/elements/XYSetting";
import { useCustomParam } from "~/features/recipe/hooks/useCustomParam";

import type { IsReadonlyProp } from "../../types";

export const ShiftXY = ({
	isReadonly = false,
}: IsReadonlyProp): JSX.Element => {
	const { shiftX, shiftY, setShiftX, setShiftY, enableLayoutX, enableLayoutY } =
		useCustomParam();
	return (
		<XYSetting
			legend="Shift"
			x={shiftX ?? 0}
			y={shiftY ?? 0}
			setX={setShiftX}
			setY={setShiftY}
			labelX="X [nm]"
			labelY="Y [nm]"
			min={0.0}
			max={1000.0}
			step={0.001}
			disabledX={isReadonly || !enableLayoutX}
			disabledY={isReadonly || !enableLayoutY}
			decimalPlaces={3}
		/>
	);
};
