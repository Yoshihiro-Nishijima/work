import { FormControlLabel, Stack, Switch, Typography } from "@mui/material";
import type { ChangeEvent } from "react";

import { Fieldset } from "~/components/layouts";
import {
	useInspectionParam,
	useSetInspectionParam,
} from "~/features/recipe/hooks/useInspectionParam";

import { LabeledNumberInput } from "..";

export const DefectGroupSetting = (): JSX.Element => {
	const { grouping, distance } = useInspectionParam();
	const { setGrouping, setDistance } = useSetInspectionParam();

	const handleChange = (
		event: ChangeEvent<HTMLInputElement>,
		checked: boolean,
	): void => {
		setGrouping(checked);
	};

	return (
		<Fieldset legend="Defect Group Setting">
			<Stack direction="row">
				<FormControlLabel
					checked={grouping}
					control={<Switch size="small" onChange={handleChange} />}
					label={
						<Typography variant="body2" mr={1} color="text.secondary">
							Grouping
						</Typography>
					}
					labelPlacement="start"
					sx={{ marginLeft: 0 }}
				/>
				<LabeledNumberInput
					label="Distance [nm]"
					num={distance}
					setNum={setDistance}
					min={0.0}
					max={100000.0}
					decimalPlaces={1}
					step={0.1}
					disabled={!grouping}
					labelXs={7}
				/>
			</Stack>
		</Fieldset>
	);
};
