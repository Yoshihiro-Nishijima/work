import TuneIcon from "@mui/icons-material/Tune";
import { Box, Button, Dialog, Stack, Typography } from "@mui/material";
import { useState } from "react";

import { Spacing } from "~/components/elements";
import { Fieldset } from "~/components/layouts";
import { TitleBarWithCloseButton } from "~/features/integrated-viewer-sfov-view/components/TitleBarWithCloseButton";
import { TrainingParametersD2D } from "~/features/training-param-setting/components/TrainingParametersD2D";
import { TrainingParametersD2DB } from "~/features/training-param-setting/components/TrainingParametersD2DB";

import { ReExecuteTrainingButton } from "~/features/training-param-setting/components/ReExecuteTrainingButton";
import { useTrainingTypeParam } from "../hooks/useTrainingTypeParam";
import { ModelNameSetting } from "./ModelNameSetting";
import { TrainingTypeSelect } from "./TrainingTypeSelect";

export const TrainingParameterSettingsModal = (): JSX.Element => {
	const { trainingType } = useTrainingTypeParam();
	const [open, setOpen] = useState(false);

	const handleClickOpen = (): void => {
		setOpen(true);
	};
	const handleClose = (): void => {
		setOpen(false);
	};

	return (
		<>
			<Button
				variant="contained"
				onClick={handleClickOpen}
				sx={{
					fontSize: "0.75rem",
					width: 170,
					height: 24,
					display: "flex",
					flexDirection: "row",
					justifyContent: "start",
				}}
			>
				<Stack sx={{ alignItems: "Center" }} direction="row">
					<TuneIcon sx={{ mx: 0, p: 0 }} />
					<Typography sx={{ ml: 1, textTransform: "none" }}>
						Set Parameters
					</Typography>
				</Stack>
			</Button>

			<Dialog
				open={open}
				onClose={handleClose}
				maxWidth="md"
				aria-labelledby="parameter-settings-title"
				aria-describedby="parameter-settings-description"
			>
				{/** 入力フォームが丁度良く並ぶように幅を固定 */}
				<Box sx={{ width: "680px" }}>
					<TitleBarWithCloseButton
						title="parameter settings"
						onClickEvent={handleClose}
						sx={{ textAlign: "Center" }}
					/>
					<Box p={1}>
						<TrainingTypeSelect />
						<ModelNameSetting />
						<Spacing my={2} />
						<Fieldset
							legend="Training Parameters"
							sx={{ textAlign: "left", height: "100%" }}
						>
							{trainingType === "D2D" && <TrainingParametersD2D />}
							{trainingType === "D2DB" && <TrainingParametersD2DB />}
							<Spacing my={2} />
							<ReExecuteTrainingButton />
						</Fieldset>
					</Box>
				</Box>
			</Dialog>
		</>
	);
};
