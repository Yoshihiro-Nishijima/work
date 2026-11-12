import { XYSetting } from "~/components/elements";

import {
	useCorrectionParam,
	useNoDesign,
	useSetCorrectionParam,
} from "../../hooks";

export const CorrectionMagXY = (): JSX.Element => {
	const { correctionMagX, correctionMagY } = useCorrectionParam();
	const { setCorrectionMagX, setCorrectionMagY } = useSetCorrectionParam();
	const noDesign = useNoDesign();

	return (
		<XYSetting
			legend="Correction Magnification"
			x={correctionMagX}
			y={correctionMagY}
			setX={setCorrectionMagX}
			setY={setCorrectionMagY}
			disabledX={noDesign}
			disabledY={noDesign}
			labelX="X"
			labelY="Y"
			min={0.5}
			max={1.5}
			step={0.0000000001}
			decimalPlaces={10}
			sx={{ width: "150px" }}
		/>
	);
};
