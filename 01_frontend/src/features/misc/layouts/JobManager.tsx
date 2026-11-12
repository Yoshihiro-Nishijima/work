import "allotment/dist/style.css";

import { Box } from "@mui/material";
import { Allotment } from "allotment";

import { JobManagerInfo } from "~/features/job-manager-info";
import { ProgressInfo } from "~/features/progress-monitor/layouts/ProgressInfo";
import { useTrainingParamVisible } from "~/features/training-param-setting/hooks/useTrainingParamVisible";
import { TrainableModelDetail } from "~/features/training-param-setting/layouts/TrainableModelDetail";
// ...existing code...
import { useRecipeVisible } from "../hooks/useRecipeVisible";
import { HEADER_HEIGHT } from "./Management";
import { Recipe } from "./Recipe";

export const JobManager = (): JSX.Element => {
	const { recipeVisible } = useRecipeVisible();
	const { trainingParamVisible } = useTrainingParamVisible();

	return (
		<Box sx={{ height: `calc(100vh - ${HEADER_HEIGHT})` }}>
			<Allotment minSize={100} defaultSizes={[200, 100]}>
				<Allotment vertical minSize={180} defaultSizes={[420, 500]}>
					<ProgressInfo />
					<JobManagerInfo />
				</Allotment>
				<Allotment.Pane visible={recipeVisible || trainingParamVisible}>
					{recipeVisible && <Recipe />}
					{trainingParamVisible && <TrainableModelDetail />}
				</Allotment.Pane>
			</Allotment>
		</Box>
	);
};
