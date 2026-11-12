import { Box } from "@mui/material";
import { Tabs } from "~/components/layouts";
import { TrainingProgressMonitor } from "~/features/progress-monitor";
import { DatasetDataGrid } from "../components/DatasetDataGrid";
import { ModelDataGrid } from "../components/ModelDataGrid";
import { RecipeResultDataGrid } from "../components/RecipeResultDataGrid";

export const ModelManager = (): JSX.Element => {
	const style = {
		height: "calc(100% - 48px)",
	};
	return (
		<Box sx={{ height: "100%", width: "100%" }}>
			<Tabs
				labels={["RECIPE RESULT", "DATASET", "MODEL", "TRAINING PROGRESS"]}
				panels={[
					<RecipeResultDataGrid key={0} />,
					<DatasetDataGrid key={1} />,
					<ModelDataGrid key={2} />,
					<TrainingProgressMonitor key={3} />,
				]}
				uiVariant="inherit"
				isCentered={false}
				style={style}
			/>
		</Box>
	);
};
