import { FormControlLabel, Switch, Typography } from "@mui/material";

import { useSetDesignEnabled } from "../../hooks";

export interface DesignSwitchProps {
	checked: boolean;
	readonly?: boolean;
	hidden?: boolean;
}

export const DesignSwitch = ({
	checked,
	readonly,
	hidden,
}: DesignSwitchProps): JSX.Element => {
	const setDesignEnabled = useSetDesignEnabled();

	return (
		<FormControlLabel
			checked={checked}
			control={
				<Switch
					size="small"
					onChange={
						readonly ? undefined : (_, checked) => setDesignEnabled(checked)
					}
				/>
			}
			label={<Typography color="text.secondary">Design</Typography>}
			labelPlacement="start"
			sx={hidden ? { visibility: "hidden" } : undefined}
		/>
	);
};
