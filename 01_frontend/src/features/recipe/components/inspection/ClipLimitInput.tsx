import { LabeledNumberInput } from "..";
import { useInspectionParam, useSetInspectionParam } from "../../hooks";

export const ClipLimitInput = (): JSX.Element => {
	const { clipLimit, brightnessContrastCorrection } = useInspectionParam();
	const { setClipLimit } = useSetInspectionParam();
	return (
		<LabeledNumberInput
			label="Clip Limit"
			num={clipLimit}
			setNum={setClipLimit}
			max={999}
			min={1}
			step={1}
			disabled={!brightnessContrastCorrection}
		/>
	);
};
