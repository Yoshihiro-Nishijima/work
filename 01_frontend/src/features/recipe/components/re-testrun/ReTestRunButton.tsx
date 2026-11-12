import { useCallback, useEffect, useRef, useState } from "react";
import PrimaryButton from "~/components/elements/PrimaryButton";
import { Toast } from "~/components/elements/Toast";
import { useReTestRun } from "~/features/recipe/hooks/useReTestRun";

export const ReTestRunButton = (): JSX.Element => {
	const { isTestRunning, isSuccess, errorMessage, doReTestRun } =
		useReTestRun();
	const [toastOpen, setToastOpen] = useState(false);

	// トースト調整座標の計算用にボタン位置取得用ref
	const ref = useRef<HTMLButtonElement>(null);
	const refBound = ref.current?.getBoundingClientRect();

	// 左下ボタンの上あたりにトースト表示
	const displayPosition = {
		bottom: "40px",
		left: `${refBound?.left ?? 0}px`,
	};

	const handleClick = useCallback((): void => {
		doReTestRun();
	}, [doReTestRun]);

	const toastTrigger = {
		isOpen: toastOpen,
		onClose: () => setToastOpen(false),
	};

	const message = isSuccess
		? "Succeeded in sending re-test-run request."
		: (errorMessage?.map((d) => d.msg).join("\r\n") ?? "Re-TestRun  Error");

	useEffect(() => {
		if (isSuccess || errorMessage != null) {
			setToastOpen(true);
		}
	}, [isSuccess, errorMessage]);

	return (
		<>
			<PrimaryButton
				loading={isTestRunning}
				// PROCESSING表示ではなく、ぐるぐるを表示する場合はこのプロパティを無効化
				loadingIndicator="PROCESSING"
				onClick={handleClick}
			>
				Test-Run
			</PrimaryButton>
			<Toast
				message={message}
				trigger={toastTrigger}
				anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
				severity={isSuccess ? "success" : "error"}
				displayPosition={displayPosition}
			/>
		</>
	);
};
