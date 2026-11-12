import { Grid, Slider } from "@mui/material";

import { NumberInput } from "~/components/elements";
import { LabeledFormGrid } from "~/components/elements/LabeledFormGrid";

export interface SliderProp {
	label: string;
	num: number;
	setNum: (x: number) => void;
	step?: number;
	min?: number;
	max?: number;
	decimalPlaces?: number;
	disabled?: boolean;
	labelXs?: number;
	track?: false | "inverted" | "normal" | undefined;
}

export const LabeledSlider = ({
	label,
	num,
	setNum,
	step = 1,
	min = 0,
	max = 100,
	decimalPlaces = 0,
	disabled = false,
	labelXs = 2,
	track = "inverted",
}: SliderProp): JSX.Element => {
	const handleSliderChange = (
		_event: Event,
		newValue: number | number[],
	): void => {
		setNum(Array.isArray(newValue) ? newValue[0] : newValue);
	};

	return (
		<LabeledFormGrid label={label} labelXs={labelXs} disabled={disabled}>
			<Grid container alignItems="baseline" justifyContent="center">
				<Grid item xs={9}>
					<Slider
						size="small"
						sx={{ padding: "0", marginLeft: "1em", width: "80%" }}
						defaultValue={num}
						value={num}
						onChange={handleSliderChange}
						valueLabelDisplay="off"
						min={min}
						max={max}
						track={track}
						disabled={disabled}
					/>
				</Grid>
				<Grid item xs={3}>
					<NumberInput
						num={num}
						setNum={setNum}
						step={step}
						min={min}
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
