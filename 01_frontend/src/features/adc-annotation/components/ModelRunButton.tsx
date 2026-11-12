import { useCallback, useEffect, useRef, useState } from "react";
import { LoadingOverlay, Select } from "~/components/elements";
import PrimaryButton from "~/components/elements/PrimaryButton";
import { Toast } from "~/components/elements/Toast";
import { useDatasetRun } from "../hooks/useDatasetRun";
import { useEditCategories } from "../hooks/useEditCategories";
import { type ModeType, ModeTypeList } from "../types";
import { ADCModelList } from "./ADCModelList";
import { ADCSaveModelButton } from "./ADCSaveModelButton";

export const ModelRunButton = (): JSX.Element => {
	const { runState, message, runDataset, resetRun } = useDatasetRun();
	const { hasEditingCategories } = useEditCategories();

	const [mode, setModeState] = useState<ModeType>("New Model");
	const [adcModel, setADCModel] = useState("");
	const [runToastOpen, setRunToastOpen] = useState(false);

	// RUNボタン活性条件：
	// modeがNew Modelの場合:編集中のカテゴリが存在しないとき活性
	// modeがExisting Modelの場合:編集中のカテゴリが存在しない かつ adcModelが選択されているとき　活性
	const runEnabled =
		!hasEditingCategories && (mode === "New Model" || adcModel !== "");

	// SaveModelボタン活性条件：RUN成功かつ編集中のカテゴリが存在しない
	const saveModelEnabled = runState === "SUCCESS" && !hasEditingCategories;

	// トースト調整座標の計算用にボタン位置取得用ref
	const runButtonRef = useRef<HTMLButtonElement>(null);
	const runRefBound = runButtonRef.current?.getBoundingClientRect();
	const TOAST_TOP_MARGIN = 20;

	const setMode = useCallback(
		(modeValue: string) => {
			const newMode = modeValue as ModeType;
			if (mode === newMode) return;
			setModeState(newMode);
			// Mode変更時にRUN状態リセット
			resetRun();
		},
		[mode, resetRun],
	);

	// 左上ボタンの下あたりにトースト表示
	const runMessageDisplayPosition = {
		top: `${(runRefBound?.bottom ?? 0) + TOAST_TOP_MARGIN}px`,
		right: `${Math.max(0, window.innerWidth - (runRefBound?.right ?? 0))}px`,
	};

	const handleRun = (): void => {
		if (mode === "Existing Model") {
			runDataset(adcModel);
		} else {
			runDataset();
		}
	};

	const runToastTrigger = {
		isOpen: runToastOpen,
		onClose: () => setRunToastOpen(false),
	};

	// RUN 結果通知
	useEffect(() => {
		if (["SUCCESS", "FAILURE"].includes(runState)) setRunToastOpen(true);
	}, [runState]);

	return (
		<>
			<div>
				<Select
					item={mode}
					setItem={setMode}
					label="Mode"
					selectOptions={[...ModeTypeList]}
					fullWidth
				/>
			</div>
			{mode !== "New Model" && (
				<ADCModelList model={adcModel} setModel={setADCModel} />
			)}
			<PrimaryButton
				loading={runState === "IN_PROGRESS"}
				onClick={handleRun}
				disabled={!runEnabled}
				ref={runButtonRef}
			>
				RUN
			</PrimaryButton>
			{mode === "New Model" && (
				<ADCSaveModelButton disabled={!saveModelEnabled} />
			)}
			<Toast
				message={message || ""}
				severity={runState === "SUCCESS" ? "success" : "error"}
				trigger={runToastTrigger}
				anchorOrigin={{ vertical: "top", horizontal: "right" }}
				displayPosition={runMessageDisplayPosition}
			/>
			<LoadingOverlay open={runState === "IN_PROGRESS"} message="Training..." />
		</>
	);
};
