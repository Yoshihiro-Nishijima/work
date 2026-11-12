import { Button, Paper, Stack, Typography } from "@mui/material";
import { ProgressBar } from "~/components/elements";

export interface DatasetCreationProgressProps {
	visible: boolean;
	isCreating: boolean;
	isCancelling: boolean;
	datasetType?: string;
	datasetName: string;
	progress: number;
	cancel: () => void;
}

export const DatasetCreationProgress = ({
	visible,
	isCreating,
	isCancelling,
	datasetType,
	datasetName,
	progress,
	cancel,
}: DatasetCreationProgressProps) => {
	if (!visible) return null;

	return (
		<Paper elevation={1} sx={{ p: 2 }}>
			<Stack spacing={2}>
				<Typography>
					{isCreating &&
						`Creating ${datasetType || ""} dataset "${datasetName || ""}"`}
					{isCancelling && "Cancelling..."}
				</Typography>
				<ProgressBar value={progress} />
				{isCreating && (
					<Button
						variant="outlined"
						color="warning"
						sx={{ maxWidth: 100 }}
						onClick={cancel}
					>
						CANCEL
					</Button>
				)}
			</Stack>
		</Paper>
	);
};
