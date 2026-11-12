import { Stack } from "@mui/material";

import { LabeledNumberInput } from "~/features/recipe/components";

import { useTrainingParameterD2D } from "../../hooks/useTrainingParametersD2D";
import { CheckboxFieldSet } from "../CheckboxFieldSet";

export const BrightnessParams = (): JSX.Element => {
	const {
		clipLimitValue,
		blockSizeValue,
		isBrightness,
		setClipLimitValue,
		setBlockSizeValue,
		setIsBrightness,
	} = useTrainingParameterD2D();

	return (
		<CheckboxFieldSet
			label="Brightness Contrast Correction"
			checked={isBrightness}
			setChecked={setIsBrightness}
		>
			<Stack>
				<LabeledNumberInput
					label="Clip Limit:"
					num={clipLimitValue}
					setNum={setClipLimitValue}
					disabled={!isBrightness}
					min={1}
					max={999}
				/>
				<LabeledNumberInput
					label="Block Size:"
					num={blockSizeValue}
					setNum={setBlockSizeValue}
					disabled={!isBrightness}
					min={128}
					max={9999}
				/>
			</Stack>
		</CheckboxFieldSet>
	);
};
