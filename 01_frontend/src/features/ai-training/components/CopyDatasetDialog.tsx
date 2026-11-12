import {
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	Stack,
	TextField,
} from "@mui/material";
import { type ChangeEvent, useEffect, useRef, useState } from "react";
import PrimaryButton from "~/components/elements/PrimaryButton";
import SecondaryButton from "~/components/elements/SecondaryButton";
import { Toast } from "~/components/elements/Toast";
import { VALID_ERROR_MESSAGE } from "~/config";
import { useCopyDataset } from "../hooks/useCopyDataset";
import { DatasetCreationProgress } from "./DatasetCreationProgress";

export interface CopyDatasetDialogProps {
	open: boolean;
	onClose: (isCopied: boolean) => void;
}

export const CopyDatasetDialog = ({
	open,
	onClose,
}: CopyDatasetDialogProps): JSX.Element => {
	const {
		sourceDatasetType,
		destinationDatasetName,
		setDestinationDatasetName,
		isError,
		isSuccess,
		isSubmitting,
		isCreating,
		isCancelling,
		progress,
		message,
		reset,
		copy,
		cancel,
	} = useCopyDataset();
	const [datasetNameError, setDatasetNameError] = useState(false);
	const datasetNameRef = useRef<HTMLInputElement>(null);
	const [toastOpen, setToastOpen] = useState(false);
	const [toastSeverity, setToastSeverity] = useState<"success" | "error">(
		"success",
	);

	// success/error/creating を検知
	useEffect(() => {
		if ((isSuccess || isError || isCreating) && message) {
			setToastSeverity(isSuccess ? "success" : "error");
			setToastOpen(true);
		}
	}, [isSuccess, isError, isCreating, message]);

	// トースト調整座標の計算用にボタン位置取得用ref
	const ref = useRef<HTMLButtonElement>(null);
	const refBound = ref.current?.getBoundingClientRect();
	const TOAST_TOP_MARGIN = 20;

	// ボタンの下あたりにトースト表示
	const displayPosition = {
		top: `${(refBound?.bottom ?? 0) + TOAST_TOP_MARGIN}px`,
		right: `${!refBound ? 0 : window.innerWidth - refBound?.right}px`,
	};

	const handleDatasetNameChange = (
		e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
	): void => {
		setDestinationDatasetName(e.target.value);
		if (datasetNameRef.current != null) {
			setDatasetNameError(!datasetNameRef.current.validity.valid);
		}
	};

	const handleClose = () => {
		// コピー中は閉じない
		if (isBusy) return;
		reset();
		onClose(isSuccess);
	};

	const toastTrigger = {
		isOpen: toastOpen,
		onClose: () => {
			setToastOpen(false);
			// 成功トーストを閉じる際にダイアログも閉じる
			if (isSuccess) handleClose();
		},
	};

	const isBusy = isSubmitting || isCreating || isCancelling;
	const disableInputs = isBusy || isSuccess;
	const disableCopy =
		!destinationDatasetName || datasetNameError || isBusy || isSuccess;

	return (
		<Dialog open={open} onClose={handleClose} fullWidth>
			<DialogTitle>Copy Dataset</DialogTitle>
			<DialogContent>
				<Stack spacing={2}>
					<TextField
						label="Dataset Name"
						variant="standard"
						value={destinationDatasetName}
						onChange={handleDatasetNameChange}
						error={datasetNameError}
						inputProps={{ pattern: "^[a-zA-Z0-9_\\-]+$", maxLength: 70 }}
						inputRef={datasetNameRef}
						helperText={datasetNameError ? VALID_ERROR_MESSAGE : ""}
						disabled={disableInputs}
					/>

					<DatasetCreationProgress
						visible={isCreating || isCancelling}
						isCreating={isCreating}
						isCancelling={isCancelling}
						datasetType={sourceDatasetType}
						datasetName={destinationDatasetName}
						progress={progress}
						cancel={cancel}
					/>
				</Stack>
			</DialogContent>
			<DialogActions>
				<SecondaryButton onClick={handleClose} disabled={isBusy}>
					CLOSE
				</SecondaryButton>
				<PrimaryButton
					onClick={copy}
					loading={isBusy}
					disabled={disableCopy}
					ref={ref}
				>
					COPY
				</PrimaryButton>
				<Toast
					message={message || ""}
					severity={toastSeverity}
					trigger={toastTrigger}
					anchorOrigin={{ vertical: "top", horizontal: "right" }}
					displayPosition={displayPosition}
				/>
			</DialogActions>
		</Dialog>
	);
};
