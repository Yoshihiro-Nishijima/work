import { Stack } from "@mui/material";

import { Fieldset } from "~/components/layouts";

import { Blur, BrightnessContrastCorrection, Zoom } from ".";
import { useJobType } from "../../hooks";

export const Preprocessing = (): JSX.Element | null => {
	const jobType = useJobType();
	if (jobType !== "C2C" && jobType !== "D2D") return null;

	return (
		<Fieldset legend="Preprocessing" sx={{ width: "460px" }}>
			<Stack>
				<BrightnessContrastCorrection />
				<Blur />
				<Zoom />
			</Stack>
		</Fieldset>
	);
};
