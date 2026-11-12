import { Stack } from "@mui/material";

import { TitleBar } from "~/components/elements";

import { ClassifiedDataGrid } from "../components/ClassifiedDataGrid";

export const ClassifiedResult  = (): JSX.Element => {
	return (
		<Stack sx={{ height: "100%", width: "100%" }}>
			<TitleBar title="Classified Result" sx={{ height: 24 }} />
			<ClassifiedDataGrid />
		</Stack>
	);
};
