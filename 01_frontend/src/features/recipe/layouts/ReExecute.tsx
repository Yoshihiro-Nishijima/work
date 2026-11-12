import { Box } from "@mui/material";

import { Spacing } from "~/components/elements";

import { ReExecuteButton } from "../components/re-execute";

export const ReExecute = (): JSX.Element => {
	return (
		<Box
			justifyContent="right"
			sx={{ height: 48, display: "flex", alignItems: "center" }}
		>
			<ReExecuteButton />
			<Spacing mx={1} />
		</Box>
	);
};
