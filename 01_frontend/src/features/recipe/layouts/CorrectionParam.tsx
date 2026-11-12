import { Stack } from "@mui/material";

import {
	CorrectionMagXY,
	CorrectionRotation,
	DigitalABCC,
} from "../components/correction";

export const CorrectionParam = (): JSX.Element => {
	return (
		<Stack spacing={1} m={2} width="350px">
			<CorrectionMagXY />
			<CorrectionRotation />
			<DigitalABCC />
		</Stack>
	);
};
