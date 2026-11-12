import { Stack } from "@mui/material";

import { LabeledNumberInput } from "~/features/recipe/components";

import { useTrainingParameterD2D } from "../../hooks/useTrainingParametersD2D";
import { CheckboxFieldSet } from "../CheckboxFieldSet";

export const ZoomParams = (): JSX.Element => {
	const { ratioValue, isZoom, setRatioValue, setIsZoom } =
		useTrainingParameterD2D();

	return (
		<CheckboxFieldSet label="Zoom" checked={isZoom} setChecked={setIsZoom}>
			<Stack>
				<LabeledNumberInput
					label="Ratio:"
					num={ratioValue}
					setNum={setRatioValue}
					decimalPlaces={3}
					disabled={!isZoom}
					min={0.1}
					max={5.0}
					step={0.001}
				/>
			</Stack>
		</CheckboxFieldSet>
	);
};
