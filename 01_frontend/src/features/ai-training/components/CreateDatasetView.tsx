import { Button, Paper, Stack, TextField } from "@mui/material";
import { type ChangeEvent, useEffect, useRef, useState } from "react";
import { Select } from "~/components/elements";
import { Toast } from "~/components/elements/Toast";
import { VALID_ERROR_MESSAGE } from "~/config";
import { useCreateDataset } from "../hooks/useCreateDataset";
import { useCreateDatasetParam } from "../hooks/useCreateDatasetParam";
import { useSourceList } from "../hooks/useSourceList";
import { DatasetTypeList } from "../types";
import { DatasetCreationProgress } from "./DatasetCreationProgress";
import { SourceDataGrid } from "./SourceDataGrid";

export const CreateDatasetView = (): JSX.Element => {
	const {
		datasetType,
		setDatasetType,
		resetDatasetType,
		datasetName,
		setDatasetName,
		resetDatasetName,
		sourceList,
	} = useCreateDatasetParam();
	const [datasetNameError, setDatasetNameError] = useState(false);
	const datasetNameRef = useRef<HTMLInputElement>(null);
	const { removeAll } = useSourceList();
	const [toastOpen, setToastOpen] = useState(false);
	const {
		isError,
		isSuccess,
		isSubmitting,
		isCreating,
		isCancelling,
		progress,
		message,
		submit,
		cancel,
		reset,
	} = useCreateDataset();

	// トースト調整座標の計算用にボタン位置取得用ref
	const ref = useRef<HTMLButtonElement>(null);
	const refBound = ref.current?.getBoundingClientRect();
	const TOAST_TOP_MARGIN = 20;

	// 左上ボタンの下あたりにトースト表示
	const displayPosition = {
		top: `${(refBound?.bottom ?? 0) + TOAST_TOP_MARGIN}px`,
		left: `${refBound?.left ?? 0}px`,
	};

	// success/error/creating を検知
	useEffect(() => {
		if ((isSuccess || isError || isCreating) && message) {
			setToastOpen(true);
		}
	}, [isSuccess, isError, isCreating, message]);

	const handleDatasetNameChange = (
		e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
	): void => {
		setDatasetName(e.target.value);
		if (datasetNameRef.current != null) {
			setDatasetNameError(!datasetNameRef.current.validity.valid);
		}
	};

	const handleSubmit = (): void => {
		if (!datasetName || datasetNameError) return;
		submit();
	};

	const toastTrigger = {
		isOpen: toastOpen,
		onClose: () => {
			if (isSuccess) {
				// 成功トーストを閉じる際にフォームをリセット
				resetDatasetType();
				resetDatasetName();
				setDatasetNameError(false);
				removeAll();
				reset();
			}
			setToastOpen(false);
		},
	};

	const disableInputs = isSubmitting || isCreating || isSuccess;
	const disableCreate =
		isSubmitting ||
		isCreating ||
		isCancelling ||
		!datasetName ||
		datasetNameError ||
		sourceList.length === 0;

	return (
		<Stack direction="row" spacing={2} padding={2}>
			<Paper elevation={1} sx={{ p: 2, flex: 1 }}>
				<Stack spacing={2}>
					<Select
						item={datasetType}
						setItem={(v) => setDatasetType(v)}
						label="Dataset Type"
						selectOptions={[...DatasetTypeList]}
						disabled={disableInputs}
						sx={{ maxWidth: 150 }}
						fullWidth
					/>
					<TextField
						label="Dataset Name"
						variant="standard"
						value={datasetName}
						onChange={handleDatasetNameChange}
						error={datasetNameError}
						inputProps={{ pattern: "^[a-zA-Z0-9_\\-]+$", maxLength: 70 }}
						inputRef={datasetNameRef}
						helperText={datasetNameError ? VALID_ERROR_MESSAGE : ""}
						disabled={disableInputs}
					/>
					<Button
						variant="contained"
						sx={{ maxWidth: 100 }}
						onClick={handleSubmit}
						disabled={disableCreate}
						ref={ref}
					>
						CREATE
					</Button>

					<Toast
						message={message || ""}
						severity={isSuccess ? "success" : "error"}
						trigger={toastTrigger}
						anchorOrigin={{ vertical: "top", horizontal: "left" }}
						displayPosition={displayPosition}
					/>

					<DatasetCreationProgress
						visible={isCreating || isCancelling}
						isCreating={isCreating}
						isCancelling={isCancelling}
						datasetType={datasetType}
						datasetName={datasetName}
						progress={progress}
						cancel={cancel}
					/>
				</Stack>
			</Paper>
			<Paper elevation={1} sx={{ p: 2, flex: 1 }}>
				<SourceDataGrid />
			</Paper>
		</Stack>
	);
};
