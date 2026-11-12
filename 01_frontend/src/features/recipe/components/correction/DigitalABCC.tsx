import { Stack } from "@mui/material";

import { CheckboxFieldSet } from "~/features/training-param-setting/components/CheckboxFieldSet";
import { LabeledNumberInput, LabeledSelect } from "../../components";
import { useDigitalABCC, useJobType } from "../../hooks";
import { type ABCCMethod, ABCCMethodList } from "../../types";

const numberInputSx = { width: "4em" };

export const DigitalABCC = (): JSX.Element | undefined => {
	const jobType = useJobType();
	const [abcc, updateADCC] = useDigitalABCC();

	switch (jobType) {
		case "Camera":
		case "Trainable D2DB":
		case "Trainable D2D":
			return;
	}

	const method = abcc.method ?? "Deep Curve Estimation";

	return (
		<CheckboxFieldSet
			checked={abcc.enabled ?? false}
			setChecked={(enabled) => {
				updateADCC({ enabled });
			}}
			label="Digital ABCC"
		>
			<Stack direction="column" spacing={2}>
				<MethodSelect
					method={method}
					setMethod={(method) => updateADCC({ method })}
					disabled={!abcc.enabled}
				/>
				{method === "Global Linear Correction" ? (
					<GlobalLinearCorrection abcc={abcc} updateABCC={updateADCC} />
				) : (
					<DeepCurveEstimation abcc={abcc} updateABCC={updateADCC} />
				)}
			</Stack>
		</CheckboxFieldSet>
	);
};

const MethodSelect = (() => {
	const methods = [...ABCCMethodList];
	const sx = { width: "fit-content" };

	return ({
		method,
		setMethod,
		disabled,
	}: {
		method: ABCCMethod;
		setMethod: (method: ABCCMethod) => void;
		disabled: boolean;
	}): JSX.Element => (
		<LabeledSelect
			label="Method"
			setItem={setMethod as Parameters<typeof LabeledSelect>[0]["setItem"]}
			selectOptions={methods}
			item={method}
			selectSx={sx}
			disabled={disabled}
		/>
	);
})();

interface MethodProp {
	abcc: ReturnType<typeof useDigitalABCC>[0];
	updateABCC: ReturnType<typeof useDigitalABCC>[1];
}

const DeepCurveEstimation = ({ abcc, updateABCC }: MethodProp): JSX.Element => {
	const disabled = !abcc.enabled;

	return (
		<>
			<LabeledNumberInput
				label="Percentile Threshold"
				num={abcc.percentileThreshold ?? 0}
				setNum={(percentileThreshold) => updateABCC({ percentileThreshold })}
				max={95}
				min={0}
				step={0.01}
				decimalPlaces={2}
				inputSx={numberInputSx}
				disabled={disabled}
			/>
			<LabeledNumberInput
				label="Downscaling Factor"
				num={abcc.downscalingFactor ?? 8}
				setNum={(downscalingFactor) => updateABCC({ downscalingFactor })}
				max={20}
				min={1}
				step={1}
				inputSx={numberInputSx}
				disabled={disabled}
			/>
			<LabeledNumberInput
				label="Contrast Gain"
				num={abcc.contrastGain ?? 1.5}
				setNum={(contrastGain) => updateABCC({ contrastGain })}
				max={5.0}
				min={0.1}
				step={0.1}
				decimalPlaces={1}
				inputSx={numberInputSx}
				disabled={disabled}
			/>
			<LabeledNumberInput
				label="Brightness Bias"
				num={abcc.brightnessBias ?? 0}
				setNum={(brightnessBias) => updateABCC({ brightnessBias })}
				max={50}
				min={0}
				step={1}
				inputSx={numberInputSx}
				disabled={disabled}
			/>
		</>
	);
};

const GlobalLinearCorrection = ({
	abcc,
	updateABCC,
}: MethodProp): JSX.Element => {
	const disabled = !abcc.enabled;

	return (
		<>
			<LabeledNumberInput
				label="Shadows"
				num={abcc.shadows ?? 0}
				setNum={(shadows) => updateABCC({ shadows })}
				max={255}
				min={-1}
				step={1}
				inputSx={numberInputSx}
				disabled={disabled}
			/>
			<LabeledNumberInput
				label="Midtones"
				num={abcc.midtones ?? 128}
				setNum={(midtones) => updateABCC({ midtones })}
				max={255}
				min={0}
				step={1}
				inputSx={numberInputSx}
				disabled={disabled}
			/>
			<LabeledNumberInput
				label="Highlights"
				num={abcc.highlights ?? 255}
				setNum={(highlights) => updateABCC({ highlights })}
				max={255}
				min={-1}
				step={1}
				inputSx={numberInputSx}
				disabled={disabled}
			/>
		</>
	);
};
