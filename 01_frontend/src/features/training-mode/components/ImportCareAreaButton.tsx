import { Button } from "@mui/material";
import { useRef, useState } from "react";
import { Toast } from "~/components/elements/Toast";
import { useImportCareArea } from "../hooks/useImportCareArea";

const TOAST_TOP_MARGIN = 20;

export const ImportCareAreaButton = (): JSX.Element => {
	const { importCareArea, importCareAreaMessage, resetMessage, isError } =
		useImportCareArea();

	const [isClicked, setIsClicked] = useState(false);

	// トースト調整座標の計算用にボタン位置取得用ref
	const ref = useRef<HTMLLabelElement>(null);
	const refBound = ref.current?.getBoundingClientRect();

	// 左上ボタンの下あたりにトースト表示
	const displayPosition = {
		top: `${(refBound?.bottom ?? 0) + TOAST_TOP_MARGIN}px`,
		left: `${refBound?.left ?? 0}px`,
	};
	const toastTrigger = {
		isOpen: importCareAreaMessage.length !== 0 && isClicked,
		onClose: () => {
			setIsClicked(false);
			resetMessage();
		},
	};

	// ファイルを選択し、ファイルの読み込み＆反映を実施
	const handleOnClickAddCareArea = (): void => {
		importCareArea();
		setIsClicked(true);
	};

	return (
		<>
			<Button
				variant="contained"
				sx={{ textTransform: "none" }}
				component="label"
				tabIndex={-1}
				onClick={handleOnClickAddCareArea}
				ref={ref}
			>
				Add CareArea
			</Button>
			<Toast
				message={importCareAreaMessage?.join("\r\n")}
				trigger={toastTrigger}
				anchorOrigin={{ vertical: "top", horizontal: "left" }}
				severity={isError ? "error" : "success"}
				displayPosition={displayPosition}
			/>
		</>
	);
};
