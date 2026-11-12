import { Stack } from "@mui/material";
import { TrainingProgressDataGrid } from "../components/TrainingProgressDataGrid";

export function TrainingProgressMonitor(): JSX.Element {
	return (
		<Stack direction="column" sx={{ height: "100%" }}>
			<TrainingProgressDataGrid />
		</Stack>
	);
}
