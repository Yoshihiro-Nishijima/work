import type { SxProps, Theme } from "@mui/material";

import { NumberInput } from "~/components/elements";
import { LabeledFormGrid } from "~/components/elements/LabeledFormGrid";

export interface NumberInputProp {
	label: string;
	num?: number;
	setNum: (x: number) => void;
	step?: number;
	min?: number;
	max?: number;
	disabled?: boolean;
	labelXs?: number;
	decimalPlaces?: number;
	inputSx?: SxProps<Theme>;
}

export const LabeledNumberInput = ({
	label,
	num,
	setNum,
	step = 1,
	min = 0,
	max = Number.MAX_VALUE,
	disabled = false,
	labelXs = 5,
	decimalPlaces = 0,
	inputSx = { width: "100%" },
}: NumberInputProp): JSX.Element => {
	return (
		<LabeledFormGrid label={label} labelXs={labelXs} disabled={disabled}>
			<NumberInput
				num={num}
				setNum={setNum}
				step={step}
				min={min}
				max={max}
				sx={inputSx}
				disabled={disabled}
				decimalPlaces={decimalPlaces}
			/>
		</LabeledFormGrid>
	);
};
