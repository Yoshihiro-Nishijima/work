import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import { IconButton } from "@mui/material";
import { useCallback, useEffect, useState } from "react";

import { ErrorDialog } from "~/components/elements/ErrorDialog";
import PrimaryButton from "~/components/elements/PrimaryButton";
import { Toast } from "~/components/elements/Toast";
import { useReExecute } from "~/features/recipe/hooks/useReExecute";
import { useExecuteRecipeCommonParam, useJobType } from "../../hooks";
// 右下ボタンの丁度上あたりにトースト表示
const displayPosition = {
	bottom: "40px",
	right: "16px",
};
const SUCCESS_MESSAGE = "Succeeded in sending re-execution request.";
const ERROR_DIALOG_TITLE = "Re-Execute Error";
const ERROR_DIALOG_WIDTH = 450;

export const ReExecuteButton = (): JSX.Element => {
	const { isExecuting, isSuccess, errorMessage, doReExecute } = useReExecute();
	const { jobName } = useExecuteRecipeCommonParam();
	const [toastOpen, setToastOpen] = useState(false);
	const [dialogOpen, setDialogOpen] = useState(false);
	const jobType = useJobType();
	const isReExecuteEnabled = jobType !== "Camera";
	const [executedJobName, setExecutedJobName] = useState<string | null>(null);
	const [dialogPosition, setDialogPosition] = useState({ x: 0, y: 0 });

	const handleClick = useCallback((): void => {
		setExecutedJobName(jobName);
		void doReExecute()();
	}, [doReExecute, jobName]);

	const toastTrigger = {
		isOpen: toastOpen,
		onClose: () => setToastOpen(false),
	};

	const handleDialogOpen = () => {
		setDialogOpen(true);
	};

	const handleDialogClose = () => {
		setDialogOpen(false);
	};

	useEffect(() => {
		if (isSuccess) {
			setToastOpen(true);
			return;
		}
		if (errorMessage != null) {
			setDialogOpen(true);
		}
	}, [isSuccess, errorMessage]);

	useEffect(() => {
		if (executedJobName !== null && executedJobName !== jobName) {
			setExecutedJobName(null);
		}
	}, [jobName, executedJobName]);

	useEffect(() => {
		if (dialogOpen) {
			const recipeElement = document.getElementById("recipe-area");
			const rect = recipeElement?.getBoundingClientRect();
			const position = rect
				? {
						// Recipeエリアの左端から30px左
						x: rect.left - (ERROR_DIALOG_WIDTH + 30),
						// Recipeエリアの上端から30px下
						y: rect.top + 30,
					}
				: { x: 0, y: 0 };
			setDialogPosition(position);
		}
	}, [dialogOpen]);

	return (
		<>
			{errorMessage != null && executedJobName === jobName && (
				<IconButton
					color="error"
					onClick={handleDialogOpen}
					data-testid="error-button"
				>
					<ErrorOutlineIcon />
				</IconButton>
			)}

			<PrimaryButton
				loading={isExecuting}
				// ぐるぐる表示ではなくSendingを表示する場合はこのプロパティを有効化
				// loadingIndicator="Sending"
				onClick={handleClick}
				disabled={!isReExecuteEnabled}
			>
				Re-execute
			</PrimaryButton>

			<Toast
				message={SUCCESS_MESSAGE}
				trigger={toastTrigger}
				anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
				severity={isSuccess ? "success" : "error"}
				displayPosition={displayPosition}
			/>
			<ErrorDialog
				open={dialogOpen}
				onClose={handleDialogClose}
				message={errorMessage}
				title={ERROR_DIALOG_TITLE}
				position={dialogPosition}
				width={ERROR_DIALOG_WIDTH}
			/>
		</>
	);
};
