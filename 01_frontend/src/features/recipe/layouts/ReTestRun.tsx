import { Box } from "@mui/material";

import { Spacing } from "~/components/elements";

import { ReTestRunButton } from "../components/re-testrun";

export const ReTestRun = (): JSX.Element => {
	return (
		<Box
			justifyContent="right"
			sx={{ height: 48, display: "flex", alignItems: "center" }}
		>
			<ReTestRunButton />
			<Spacing mx={1} />
		</Box>
	);
};
