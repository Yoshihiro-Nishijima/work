import { Stack } from "@mui/material";

import { Fieldset } from "~/components/layouts";
import { useInspectionParam, useSetInspectionParam } from "../../hooks";
import { LabeledNumberInput } from "../LabeledNumberInput";

interface FeatureAnglesProps {
	label: string;
	value: number;
	setter: (x: number) => void;
}

const FeatureAngles = ({
	label,
	value,
	setter,
}: FeatureAnglesProps): JSX.Element => {
	return (
		<LabeledNumberInput
			label={`${label} [deg]`}
			num={value}
			setNum={setter}
			min={0}
			max={179.9}
			step={0.1}
			decimalPlaces={1}
		/>
	);
};

const toFourAngles = (angles: number[]): number[] => {
	return Array.from({ length: 4 }, (_, index) => angles[index] ?? 0);
};

export const DefectFeatureExtractionSetting = (): JSX.Element => {
	const { featureAngles } = useInspectionParam();
	const { setFeatureAngles } = useSetInspectionParam();
	const angles = toFourAngles(featureAngles);
	const handleSetAngle =
		(index: number) =>
		(value: number): void => {
			const nextAngles = toFourAngles(featureAngles);
			nextAngles[index] = value;
			setFeatureAngles(nextAngles);
		};
	return (
		<Fieldset
			legend="Defect Feature Extraction Setting"
			sx={{ width: "400px" }}
		>
			<Stack spacing={1}>
				{angles.map((angle, index) => (
					<FeatureAngles
						key={`feature-angle-${index + 1}`}
						label={`Feature Angles${index + 1}`}
						value={angle}
						setter={handleSetAngle(index)}
					/>
				))}
			</Stack>
		</Fieldset>
	);
};
