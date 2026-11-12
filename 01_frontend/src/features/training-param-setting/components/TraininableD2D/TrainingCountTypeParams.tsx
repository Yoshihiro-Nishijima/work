import { FormControlLabel, Radio, RadioGroup } from "@mui/material";
import Grid from "@mui/system/Unstable_Grid";

import { NumberInput } from "~/components/elements";
import type { TrainingCountType } from "../../hooks/useTrainingParametersD2D";

interface TrainingCountParamsProp {
	countType: TrainingCountType;
	count: number;
	setCountType: (value: TrainingCountType) => void;
	setCount: (value: number) => void;
	disabled?: boolean;
	min: number;
	max: number;
}

export const TrainingCountTypeParams = (
	prop: TrainingCountParamsProp,
): JSX.Element => {
	const handleChangedTrainingCountTypeRadioButtton = (
		event: React.ChangeEvent<HTMLInputElement>,
	): void => {
		prop.setCountType(
			(event.target as HTMLInputElement).value as TrainingCountType,
		);
	};

	return (
		<Grid container spacing={2}>
			<Grid xs={8}>
				<RadioGroup
					value={prop.countType}
					onChange={handleChangedTrainingCountTypeRadioButtton}
					row
				>
					<FormControlLabel
						value="Epoch"
						disabled={prop.disabled}
						control={<Radio size="small" />}
						label="Epoch"
					/>
					<FormControlLabel
						value="Iteration"
						disabled={prop.disabled}
						control={<Radio size="small" />}
						label="Iteration"
					/>
				</RadioGroup>
			</Grid>
			<Grid xs={4}>
				<NumberInput
					num={prop.count}
					setNum={prop.setCount}
					sx={{ width: "100%" }}
					disabled={prop.disabled}
					min={prop.min}
					max={prop.max}
				/>
			</Grid>
		</Grid>
	);
};
