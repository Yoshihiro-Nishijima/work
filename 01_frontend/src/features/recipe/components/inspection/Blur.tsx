import { Stack } from "@mui/material";

import { CheckboxFieldSet } from "~/features/training-param-setting/components/CheckboxFieldSet";
import { useInspectionParam, useSetInspectionParam } from "../../hooks";
import { SigmaColorInput } from "./SigmaColorInput";
import { SigmaSpaceInput } from "./SigmaSpaceInput";

export const Blur = (): JSX.Element => {
	const { blur } = useInspectionParam();
	const { setBlur } = useSetInspectionParam();

	return (
		<CheckboxFieldSet label="Blur" checked={blur} setChecked={setBlur}>
			<Stack direction="row" spacing={2}>
				<SigmaColorInput />
				<SigmaSpaceInput />
			</Stack>
		</CheckboxFieldSet>
	);
};
