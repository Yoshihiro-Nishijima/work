import { Stack } from "@mui/material";
import { useMemo } from "react";
import { ReviewButton } from "~/features/training-mode/components/ReviewButton";

import { TrainingParameterSettingsModal } from "~/features/training-mode/components/TrainingParameterSettingsModal";

// TrainginMode用のsFOVDataGridのフッターの高さ
export const SFOV_DATAGRID_FOOTER_HEIGHT = 60;

// TrainginMode用のsFOVDataGridのフッター配置アイコン
export const SFovDataGridForTrainingFooter = (): JSX.Element => {
	return useMemo(
		() => (
			<Stack
				spacing={1}
				sx={{
					position: "absolute",
					height: SFOV_DATAGRID_FOOTER_HEIGHT,
					mt: 0,
					ml: 1,
					p: 0,
				}}
			>
				<ReviewButton />
				<TrainingParameterSettingsModal />
			</Stack>
		),
		[],
	);
};
