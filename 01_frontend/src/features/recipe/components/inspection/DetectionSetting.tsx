import { Stack } from "@mui/material";

import { Fieldset } from "~/components/layouts";

import {
	AlgorithmVersionRadio,
	MatchingDownscaleFactorSelect,
	ModelListBox,
	NegativeGainInput,
	PositiveGainInput,
	SearchAreaInput,
	ThresholdInput,
	ToleranceDistanceInput,
} from ".";

interface DetectionSettingProps {
	isModelReadonly: boolean;
}

export const DetectionSetting = ({
	isModelReadonly,
}: DetectionSettingProps): JSX.Element => {
	return (
		<Fieldset legend="Detection Setting" sx={{ width: "460px" }}>
			<Stack spacing={1}>
				<ModelListBox isReadonly={isModelReadonly} />
				<AlgorithmVersionRadio />
				<SearchAreaInput />
				<MatchingDownscaleFactorSelect />
				<ThresholdInput />
				<ToleranceDistanceInput />
				<PositiveGainInput />
				<NegativeGainInput />
			</Stack>
		</Fieldset>
	);
};
