import { Box, Dialog, Stack, TextField } from "@mui/material";
import { useRef, useState } from "react";
import type { ChangeEvent } from "react";

import PrimaryButton from "~/components/elements/PrimaryButton";
import SecondaryButton from "~/components/elements/SecondaryButton";
import { Toast } from "~/components/elements/Toast";
import { VALID_ERROR_MESSAGE } from "~/config";
import { useModelName } from "../hooks/useModelName";

export type ADCSaveModelButtonProps = {
	disabled?: boolean;
};

export const ADCSaveModelButton = ({
	disabled,
}: ADCSaveModelButtonProps): JSX.Element => {
	const { isLoading, doSaveModelName } = useModelName();

	const [open, setOpen] = useState(false);
	const [modelName, setModelName] = useState("");
	const [modelNameError, setModelNameError] = useState(false);
	const modelNameRef = useRef<HTMLInputElement>(null);
	const [toastOpen, setToastOpen] = useState(false);
	const [toastMessage, setToastMessage] = useState("");
	const [toastSeverity, setToastSeverity] = useState<"success" | "error">(
		"success",
	);

	// トースト調整座標の計算用にボタン位置取得用ref
	const ref = useRef<HTMLButtonElement>(null);
	const refBound = ref.current?.getBoundingClientRect();
	const TOAST_TOP_MARGIN = 20;

	// ボタンの下あたりにトースト表示
	const displayPosition = {
		top: `${(refBound?.bottom ?? 0) + TOAST_TOP_MARGIN}px`,
		right: `${!refBound ? 0 : window.innerWidth - refBound?.right}px`,
	};

	const isSaveEnabled = modelName.length > 0 && !modelNameError && !isLoading;

	const handleDialogOpen = () => {
		setOpen(true);
	};
	const handleDialogClose = () => {
		setOpen(false);
	};
	const handleModelNameChange = (
		e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
	) => {
		setModelName(e.target.value);
		if (modelNameRef.current != null) {
			setModelNameError(!modelNameRef.current.validity.valid);
		}
	};

	const handleSaveClick = async () => {
		await doSaveModelName(
			modelName,
			(msg) => {
				setToastMessage(msg);
				setToastSeverity("success");
				setToastOpen(true);
				setModelName("");
			},
			(msg) => {
				setToastMessage(msg);
				setToastSeverity("error");
				setToastOpen(true);
			},
		);
	};

	const toastTrigger = {
		isOpen: toastOpen,
		onClose: () => {
			setToastMessage("");
			setToastOpen(false);
			// 成功トーストを閉じる際にダイアログも閉じる
			if (toastSeverity === "success") setOpen(false);
		},
	};

	return (
		<>
			<PrimaryButton disabled={disabled} onClick={handleDialogOpen}>
				SAVE MODEL
			</PrimaryButton>
			<Dialog open={open} onClose={handleDialogClose} maxWidth="md">
				<Box p={2}>
					<Stack spacing={2}>
						<TextField
							label="NAME"
							variant="standard"
							value={modelName}
							onChange={handleModelNameChange}
							error={modelNameError}
							inputProps={{ pattern: "^[a-zA-Z0-9_\\-]+$", maxLength: 70 }}
							inputRef={modelNameRef}
							helperText={modelNameError ? VALID_ERROR_MESSAGE : ""}
							sx={{ width: "81ch" }}
						/>
						<Stack direction="row" spacing={2} justifyContent="flex-end">
							<SecondaryButton onClick={handleDialogClose}>
								CLOSE
							</SecondaryButton>
							<PrimaryButton
								onClick={handleSaveClick}
								loading={isLoading}
								disabled={!isSaveEnabled}
								ref={ref}
							>
								SAVE
							</PrimaryButton>
						</Stack>
					</Stack>
				</Box>
			</Dialog>
			<Toast
				message={toastMessage}
				trigger={toastTrigger}
				anchorOrigin={{ vertical: "top", horizontal: "right" }}
				displayPosition={displayPosition}
				severity={toastSeverity}
			/>
		</>
	);
};
