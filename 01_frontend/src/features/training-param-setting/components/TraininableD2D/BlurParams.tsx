import { Stack } from "@mui/material";

import { LabeledNumberInput } from "~/features/recipe/components";

import { useTrainingParameterD2D } from "../../hooks/useTrainingParametersD2D";
import { CheckboxFieldSet } from "../CheckboxFieldSet";

export const BlurParams = (): JSX.Element => {
	const {
		sigmaColorValue,
		sigmaSpaceValue,
		isBlur,
		setSigmaColorValue,
		setSigmaSpaceValue,
		setIsBlur,
	} = useTrainingParameterD2D();

	return (
		<CheckboxFieldSet label="Blur" checked={isBlur} setChecked={setIsBlur}>
			<Stack>
				<LabeledNumberInput
					label="Sigma Color:"
					num={sigmaColorValue}
					setNum={setSigmaColorValue}
					disabled={!isBlur}
					min={1}
					max={9}
				/>
				<LabeledNumberInput
					label="Sigma Space:"
					num={sigmaSpaceValue}
					setNum={setSigmaSpaceValue}
					disabled={!isBlur}
					min={1}
					max={4}
				/>
			</Stack>
		</CheckboxFieldSet>
	);
};
