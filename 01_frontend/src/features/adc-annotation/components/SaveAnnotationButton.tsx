import DeleteIcon from "@mui/icons-material/Delete";
import { IconButton } from "@mui/material";
import { useEffect, useRef, useState } from "react";
import PrimaryButton from "~/components/elements/PrimaryButton";
import { Toast } from "~/components/elements/Toast";
import { useEditCategories } from "../hooks/useEditCategories";
import { useSaveAnnotation } from "../hooks/useSaveAnnotation";

export const SaveAnnotationButton = (): JSX.Element => {
	const {
		clearEditingCategories,
		editingCategoriesList,
		hasEditingCategories,
	} = useEditCategories();
	const { isSaving, isAnnotationSaved, message, saveAnnotation } =
		useSaveAnnotation();
	const [toastOpen, setToastOpen] = useState(false);

	// トースト調整座標の計算用にボタン位置取得用ref
	const buttonRef = useRef<HTMLButtonElement>(null);
	const refBound = buttonRef.current?.getBoundingClientRect();
	const TOAST_TOP_MARGIN = 20;

	const handleClear = (): void => clearEditingCategories();

	// ボタンの下あたりにトースト表示
	const messageDisplayPosition = {
		top: `${(refBound?.bottom ?? 0) + TOAST_TOP_MARGIN}px`,
		left: `${refBound?.left ?? 0}px`,
	};

	const handleSaveAnnotation = (): void => {
		// 送信中は再実行しない（二重送信ガード）
		if (isSaving) return;
		saveAnnotation(editingCategoriesList);
	};

	// 保存結果検知
	useEffect(() => {
		if (isAnnotationSaved == null) return;
		if (isAnnotationSaved) clearEditingCategories();
		setToastOpen(true);
	}, [isAnnotationSaved, clearEditingCategories]);

	const saveToastTrigger = {
		isOpen: toastOpen,
		onClose: () => setToastOpen(false),
	};

	return (
		<>
			<IconButton
				aria-label="clear"
				disabled={!hasEditingCategories}
				onClick={handleClear}
				sx={{ padding: 0 }}
			>
				<DeleteIcon />
			</IconButton>
			<PrimaryButton
				loading={isSaving}
				disabled={!hasEditingCategories}
				onClick={handleSaveAnnotation}
				ref={buttonRef}
			>
				SAVE ANNOTATION
			</PrimaryButton>
			<Toast
				message={message || ""}
				severity={isAnnotationSaved ? "success" : "error"}
				trigger={saveToastTrigger}
				anchorOrigin={{ vertical: "top", horizontal: "left" }}
				displayPosition={messageDisplayPosition}
			/>
		</>
	);
};
