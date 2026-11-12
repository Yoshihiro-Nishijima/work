import { Grid, Slider, Typography } from "@mui/material";

import { NumberInput } from "~/components/elements";
import { LabeledFormGrid } from "~/components/elements/LabeledFormGrid";

import type { RangeValue } from "../types";

export interface RangeSliderProp {
	label: string;
	num: RangeValue;
	setNum: (value: RangeValue) => void;
	step?: number;
	min?: number;
	max?: number;
	decimalPlaces?: number;
	disabled?: boolean;
	labelXs?: number;
}

const minDistance = 0;

export const LabeledRangeSlider = ({
	label,
	num,
	setNum,
	step = 1,
	min = 0,
	max = 100,
	decimalPlaces = 0,
	disabled = false,
	labelXs = 2,
}: RangeSliderProp): JSX.Element => {
	const handleSliderChange = (
		_event: Event,
		newValue: number | number[],
		activeThumb: number,
	): void => {
		if (!Array.isArray(newValue)) {
			return;
		}

		if (activeThumb === 0) {
			setNum({
				min: Math.min(newValue[0], num.max - minDistance),
				max: num.max,
			});
		} else {
			setNum({
				min: num.min,
				max: Math.max(newValue[1], num.min + minDistance),
			});
		}
	};

	return (
		<LabeledFormGrid label={label} labelXs={labelXs} disabled={disabled}>
			<Grid container alignItems="baseline" justifyContent="center">
				<Grid item xs={6.5}>
					<Slider
						size="small"
						sx={{ padding: "0", marginLeft: "1em", width: "80%" }}
						value={[num.min, num.max]}
						onChange={handleSliderChange}
						valueLabelDisplay="off"
						min={min}
						max={max}
						disableSwap
						disabled={disabled}
					/>
				</Grid>
				<Grid item xs={2.5}>
					<NumberInput
						num={num.min}
						setNum={(value) => {
							setNum({
								min: value,
								max: num.max,
							});
						}}
						step={step}
						min={min}
						max={num.max - minDistance}
						decimalPlaces={decimalPlaces}
						sx={{ width: "100%" }}
						disabled={disabled}
					/>
				</Grid>
				<Grid item xs={0.5}>
					<Typography>~</Typography>
				</Grid>
				<Grid item xs={2.5}>
					<NumberInput
						num={num.max}
						setNum={(value) => {
							setNum({
								min: num.min,
								max: value,
							});
						}}
						step={step}
						min={num.min + minDistance}
						max={max}
						decimalPlaces={decimalPlaces}
						sx={{ width: "100%" }}
						disabled={disabled}
					/>
				</Grid>
			</Grid>
		</LabeledFormGrid>
	);
};
