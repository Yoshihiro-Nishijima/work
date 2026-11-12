import { Box, Stack } from "@mui/material";
import { Allotment } from "allotment";
import { TrainingData } from "~/features/training-param-setting";

import { TitleBar } from "~/components/elements/TitleBar";
import { useModelDataGridTabIdx } from "~/features/job-manager-info/hooks/useModelDataGridTabIdx";
import { ModelNameSetting } from "~/features/training-mode/components/ModelNameSetting";
import { mmiTheme } from "~/routes";
import { ReExecuteTrainingButton } from "../components/ReExecuteTrainingButton";
import { TrainingParametersD2D } from "../components/TrainingParametersD2D";
import { TrainingParametersD2DB } from "../components/TrainingParametersD2DB";
import { useModelData } from "../hooks/useModelData";

const HEADER_HEIGHT = "36px";

export const TrainableModelDetail = (): JSX.Element => {
	const { modelDetailList } = useModelData();
	const { trainingType } = useModelDataGridTabIdx();

	return (
		<Stack direction="column" sx={{ height: "100%", width: "100%" }}>
			<TitleBar
				title={"Training Data"}
				sx={{ height: HEADER_HEIGHT }}
				enableShadow
			/>
			<Allotment vertical>
				<Box sx={{ height: "100%", width: "100%", overflow: "auto" }}>
					<TrainingData dataList={modelDetailList} />
				</Box>
				<Stack direction="column" sx={{ height: "100%", width: "100%" }}>
					<TitleBar
						title={"Training Parameters"}
						sx={{ height: HEADER_HEIGHT }}
						enableShadow
					/>
					<Box sx={{ overflow: "auto", px: mmiTheme.spacing(1) }}>
						<ModelNameSetting />
						{trainingType === "D2D" && (
							<TrainingParametersD2D isBaseModelUsing />
						)}
						{trainingType === "D2DB" && <TrainingParametersD2DB />}
					</Box>
				</Stack>
				<Allotment.Pane minSize={48} maxSize={48}>
					<Box
						justifyContent="right"
						sx={{
							height: 48,
							display: "flex",
							alignItems: "center",
							px: mmiTheme.spacing(1),
						}}
					>
						<ReExecuteTrainingButton isBaseModelUsing />
					</Box>
				</Allotment.Pane>
			</Allotment>
		</Stack>
	);
};
