import { LabeledNumberInput } from "..";
import { useInspectionParam, useSetInspectionParam } from "../../hooks";

export const BlockSizeInput = (): JSX.Element => {
	const { blockSize, brightnessContrastCorrection } = useInspectionParam();
	const { setBlockSize } = useSetInspectionParam();
	return (
		<LabeledNumberInput
			label="Block Size"
			num={blockSize}
			setNum={setBlockSize}
			max={4096}
			min={128}
			step={1}
			disabled={!brightnessContrastCorrection}
		/>
	);
};
