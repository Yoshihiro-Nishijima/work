import { Box, Checkbox, FormControlLabel } from "@mui/material";
import type { ReactNode } from "react";

interface CheckboxFieldSetProp {
	label: string;
	children: ReactNode;
	checked: boolean;
	setChecked: (value: boolean) => void;
}

export const CheckboxFieldSet = (prop: CheckboxFieldSetProp): JSX.Element => {
	const handleChangeCheckbox = (
		e: React.ChangeEvent<HTMLInputElement>,
		checked: boolean,
	): void => {
		prop.setChecked(checked);
	};

	return (
		<Box component="fieldset" sx={{ borderWidth: "thin", width: "100%" }}>
			<legend style={{ fontSize: "small", color: "rgba(0, 0, 0, 0.6)" }}>
				<FormControlLabel
					control={
						<Checkbox checked={prop.checked} onChange={handleChangeCheckbox} />
					}
					label={prop.label}
				/>
			</legend>
			{prop.children}
		</Box>
	);
};
