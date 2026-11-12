import { Button } from "@mui/material";
import { useCallback, useEffect, useRef, useState } from "react";
import { Toast } from "~/components/elements/Toast";
import { useModelNameParam } from "~/features/training-mode/hooks/useModelNameParam";
import { useTrainingQueue } from "~/features/training-mode/hooks/useTrainingQueue";
import { useTrainingParameterD2D } from "../../hooks/useTrainingParametersD2D";

const TOAST_TOP_MARGIN = 20;

export const ReExecuteSegmentationButton = (prop: {
	isBaseModelUsing?: boolean;
}): JSX.Element => {
	const {
		doStartSegmentationTraining,
		isSegmentation: isSegmentationTraining,
		isRequesting,
		informationMessage,
		errorMessage,
	} = useTrainingQueue();
	const { isValidModelName } = useModelNameParam();
	const { isSegmentation } = useTrainingParameterD2D();

	const [toastOpen, setToastOpen] = useState(false);

	useEffect(() => {
		if (!isSegmentationTraining) return;
		setToastOpen(informationMessage != null || errorMessage != null);
	}, [isSegmentationTraining, informationMessage, errorMessage]);

	const message =
		errorMessage == null
			? (informationMessage?.join("\r\n") ?? "") ||
				(prop.isBaseModelUsing ? "Re-Execute Success" : "Re-Train Success")
			: errorMessage.map((d) => d.msg).join("\r\n") ||
				(prop.isBaseModelUsing ? "Re-Execute Error" : "Re-Train Error");

	const toastTrigger = {
		isOpen: toastOpen,
		onClose: () => setToastOpen(false),
	};

	// トースト調整座標の計算用にボタン位置取得用ref
	const ref = useRef<HTMLButtonElement>(null);
	const refBound = ref.current?.getBoundingClientRect();
	// ボタンの下あたりにトースト表示
	const snackbarTop = (refBound?.bottom ?? 0) + TOAST_TOP_MARGIN;
	const displayPosition = prop.isBaseModelUsing
		? {
				top: `${snackbarTop}px`,
				right: "20px",
			}
		: {
				top: `${snackbarTop}px`,
				left: `${refBound?.left ?? 0}px`,
			};

	const handleClickedReTrainingSegmentationButton = useCallback((): void => {
		// ボタンクリックでTrainingキューイングAPI呼び出し
		doStartSegmentationTraining(prop.isBaseModelUsing);
	}, [doStartSegmentationTraining, prop.isBaseModelUsing]);

	return (
		<div
			style={{
				textAlign: "center",
				position: "relative",
			}}
		>
			<Button
				onClick={handleClickedReTrainingSegmentationButton}
				variant="outlined"
				sx={{ width: "100px", textTransform: "none" }}
				disabled={!isSegmentation || isRequesting || !isValidModelName}
				ref={ref}
			>
				Re-{prop.isBaseModelUsing ? "Execute" : "Train"} Segmentation
			</Button>
			<Toast
				message={message}
				trigger={toastTrigger}
				anchorOrigin={
					prop.isBaseModelUsing
						? { vertical: "top", horizontal: "right" }
						: { vertical: "top", horizontal: "left" }
				}
				severity={errorMessage != null ? "error" : "success"}
				displayPosition={displayPosition}
			/>
		</div>
	);
};
