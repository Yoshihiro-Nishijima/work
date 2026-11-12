import { Stack } from "@mui/material";

import { CheckboxFieldSet } from "~/features/training-param-setting/components/CheckboxFieldSet";
import { useInspectionParam, useSetInspectionParam } from "../../hooks";
import { BlockSizeInput } from "./BlockSizeInput";
import { ClipLimitInput } from "./ClipLimitInput";

export const BrightnessContrastCorrection = (): JSX.Element => {
	const { brightnessContrastCorrection } = useInspectionParam();
	const { setBrightnessContrastCorrection } = useSetInspectionParam();

	return (
		<CheckboxFieldSet
			label="Brightness Contrast Correction"
			checked={brightnessContrastCorrection}
			setChecked={setBrightnessContrastCorrection}
		>
			<Stack direction="row" spacing={2}>
				<ClipLimitInput />
				<BlockSizeInput />
			</Stack>
		</CheckboxFieldSet>
	);
};
