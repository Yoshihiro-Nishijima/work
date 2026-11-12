import { FormControlLabel, Switch, Typography } from "@mui/material";
import { Stack } from "@mui/system";

import { ListBox } from "~/components/elements/ListBox";
import { useADCModel, useADCModels, useSetADCEnabled } from "../../hooks";

export interface ADCModelProps {
	checked: boolean;
	isReadonly: boolean;
}

export const ADCModel = ({
	checked,
	isReadonly,
}: ADCModelProps): JSX.Element => {
	const setEnabled = useSetADCEnabled();

	return (
		<Stack direction="row" spacing={3}>
			<FormControlLabel
				checked={checked}
				control={
					<Switch size="small" onChange={(_, value) => setEnabled(value)} />
				}
				label={
					<Typography variant="body2" mr={1} color="text.secondary">
						ADC
					</Typography>
				}
				labelPlacement="start"
				sx={{ width: "60px", marginTop: 2 }}
			/>
			<ADCListBox adc={checked} isReadonly={isReadonly} />
		</Stack>
	);
};

function ADCListBox({
	adc,
	isReadonly,
}: { adc: boolean; isReadonly: boolean }): JSX.Element {
	const [model, setModel] = useADCModel();
	const { adcModels, fetchAdcModels } = useADCModels();

	return (
		<ListBox
			label="Model"
			text={model}
			setText={setModel}
			selectOptions={adcModels}
			isReadonly={isReadonly || !adc}
			onOpen={fetchAdcModels}
			sx={{ width: "340px" }}
		/>
	);
}
