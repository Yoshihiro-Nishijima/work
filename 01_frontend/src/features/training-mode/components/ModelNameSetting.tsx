import { TextField } from "@mui/material";
import { type ChangeEvent, useEffect, useRef } from "react";

import { Fieldset } from "~/components/layouts";
import { VALID_ERROR_MESSAGE } from "~/config";
import { useTrainingParameterD2D } from "~/features/training-param-setting/hooks/useTrainingParametersD2D";
import { useTrainingParameterD2DB } from "~/features/training-param-setting/hooks/useTrainingParametersD2DB";
import { toLocalDateStr } from "~/utils/formatter";
import { useModelNameParam } from "../hooks/useModelNameParam";
import { useDeleteTrainingModel } from "../hooks/useTrainingQueue";

export const ModelNameSetting = (): JSX.Element => {
	const {
		modelName,
		setModelName,
		isValidModelName,
		setIsValidModelName,
		baseModelName,
	} = useModelNameParam();
	const { setIsTrainingJobQueued } = useDeleteTrainingModel();
	const { setDefaultValueTrainingParameterD2D } = useTrainingParameterD2D();
	const { setDefaultValueTrainingParameterD2DB } = useTrainingParameterD2DB();

	const modelNameRef = useRef<HTMLInputElement>(null);

	// baseModelNameが空のときは入力不可
	const isDisabled = baseModelName === "";
	const helperText = isDisabled
		? "Please select a Base Model first."
		: VALID_ERROR_MESSAGE;

	// modelNameがないときは日時から作成したデフォルト名を付ける
	// biome-ignore lint/correctness/useExhaustiveDependencies: 初回のみ設定する
	useEffect(() => {
		if (modelName === "" && !isDisabled) {
			// 現在日時時刻取得
			const dateStr = `${toLocalDateStr(Date.now())
				.replaceAll(/[-:]/g, "")
				.replaceAll(" ", "_")}_`;
			// ModelName初期値設定
			setModelName(dateStr);
			setIsValidModelName(true);
			// parameterをデフォルト値に変更
			setDefaultValueTrainingParameterD2D();
			setDefaultValueTrainingParameterD2DB();
		}
	}, []);

	const handleModelNameChange = (
		e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
	): void => {
		setModelName(e.target.value);
		if (modelNameRef.current != null) {
			const isValidName =
				e.target.value !== "" ? modelNameRef.current.validity.valid : false;
			setIsValidModelName(isValidName);
			setIsTrainingJobQueued(false);
		}
	};

	return (
		<Fieldset legend="Model Name" sx={{ width: "70%" }}>
			<TextField
				sx={{ width: "100%" }}
				value={modelName ?? ""}
				onChange={handleModelNameChange}
				error={!isValidModelName}
				inputProps={{ pattern: "^[a-zA-Z_0-9\\-]+$", maxLength: 40 }}
				inputRef={modelNameRef}
				helperText={isValidModelName ? "" : helperText}
				disabled={isDisabled}
			/>
		</Fieldset>
	);
};
