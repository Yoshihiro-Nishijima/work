import { XYSetting } from "~/components/elements/XYSetting";
import { useImportedParam } from "~/features/recipe/hooks/useImportedParam";

import type { IsReadonlyProp } from "../../types";

export const OffsetXY = ({
	isReadonly = false,
}: IsReadonlyProp): JSX.Element => {
	const { offsetX, offsetY, setOffsetX, setOffsetY } = useImportedParam();
	return (
		<XYSetting
			legend="Offset for Design Coordinate"
			x={offsetX ?? 0}
			y={offsetY ?? 0}
			labelX="X [um]"
			labelY="Y [um]"
			setX={setOffsetX}
			setY={setOffsetY}
			min={-300000}
			max={300000}
			step={0.001}
			decimalPlaces={3}
			disabledX={isReadonly}
			disabledY={isReadonly}
		/>
	);
};
