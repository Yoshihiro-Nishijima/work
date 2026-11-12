import { XYSetting } from "~/components/elements/XYSetting";
import { useCustomParam } from "~/features/recipe/hooks/useCustomParam";

import type { IsReadonlyProp } from "../../types";

export const SizeXY = ({ isReadonly = false }: IsReadonlyProp): JSX.Element => {
	const { sizeX, sizeY, setSizeX, setSizeY, enableLayoutX, enableLayoutY } =
		useCustomParam();
	return (
		<XYSetting
			legend="Size"
			x={sizeX ?? 0}
			y={sizeY ?? 0}
			setX={setSizeX}
			setY={setSizeY}
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
