import { Button } from "@mui/material";
import { useCallback, useEffect, useRef, useState } from "react";
import { Toast } from "~/components/elements/Toast";
import { useTrainingProgressInfo } from "~/features/progress-monitor/hooks/useTrainingProgressInfo";
import { useModelNameParam } from "~/features/training-mode/hooks/useModelNameParam";
import { useTrainingQueue } from "~/features/training-mode/hooks/useTrainingQueue";
import { mmiTheme } from "~/routes";

export const ReExecuteTrainingButton = (prop: {
	isBaseModelUsing?: boolean;
}): JSX.Element => {
	const {
		isRequesting,
		isSegmentation,
		doStartTraining,
		informationMessage,
		errorMessage,
		isTrainingJobQueued,
	} = useTrainingQueue();
	const { modelName, baseModelName, isValidModelName } = useModelNameParam();

	const [toastOpen, setToastOpen] = useState(false);
	const { isQueuing } = useTrainingProgressInfo();

	useEffect(() => {
		setToastOpen(
			!isSegmentation && (informationMessage != null || errorMessage != null),
		);
	}, [isSegmentation, informationMessage, errorMessage]);

	const message =
		errorMessage == null
			? (informationMessage?.join("\r\n") ?? "") ||
				(prop.isBaseModelUsing ? "Re-Execute Success" : "Start Success")
			: errorMessage.map((d) => d.msg).join("\r\n") ||
				(prop.isBaseModelUsing ? "Re-Execute Error" : "Start Error");

	const toastTrigger = {
		isOpen: toastOpen,
		onClose: () => setToastOpen(false),
	};

	// トースト調整座標の計算用にボタン位置取得用ref
	const ref = useRef<HTMLButtonElement>(null);
	const refBound = ref.current?.getBoundingClientRect();
	// ボタンの上あたりにトースト表示
	const displayPosition = prop.isBaseModelUsing
		? {
				bottom: "40px",
				right: mmiTheme.spacing(1),
			}
		: {
				top: `${(refBound?.top ?? 0) - 60}px`,
				left: `${refBound?.left ?? 0}px`,
			};

	const handleClickedReExecuteTrainingButton = useCallback((): void => {
		// ボタンクリックでTrainingキューイングAPI呼び出し
		doStartTraining(prop.isBaseModelUsing);
	}, [doStartTraining, prop.isBaseModelUsing]);

	return (
		<div style={{ textAlign: "center" }}>
			<Button
				onClick={handleClickedReExecuteTrainingButton}
				variant="contained"
				disabled={
					isRequesting ||
					isTrainingJobQueued ||
					!isValidModelName ||
					modelName === baseModelName ||
					isQueuing(modelName)
				}
				sx={{ textTransform: "none" }}
				ref={ref}
			>
				{prop.isBaseModelUsing ? "Re-Execute" : "Start"} Training
			</Button>
			<Toast
				message={message}
				trigger={toastTrigger}
				anchorOrigin={
					prop.isBaseModelUsing
						? { vertical: "bottom", horizontal: "right" }
						: { vertical: "top", horizontal: "left" }
				}
				severity={errorMessage != null ? "error" : "success"}
				displayPosition={displayPosition}
			/>
		</div>
	);
};
