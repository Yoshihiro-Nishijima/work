import { Stack } from "@mui/material";

import { CustomParam, ImportedParam, UploadParams } from ".";
import {
	CommentTextField,
	DesignSwitch,
	DesignTypeSelect,
	JobTypeSelect,
	JobTypeTypography,
	NumDefectsTextField,
} from "../components/common";
import {
	useDesignEnabledValue,
	useDesignUsage,
	useNoDesign,
	useRecipeCommonParams,
	useUploadEnable,
} from "../hooks";

export interface RecipeCommonParameterProps {
	isTestRun?: boolean;
}

export const RecipeCommonParameter = ({
	isTestRun = false,
}: RecipeCommonParameterProps): JSX.Element => {
	const { enableImported, jobType } = useRecipeCommonParams();
	const checked = useDesignEnabledValue();
	const usage = useDesignUsage();
	const noDesign = useNoDesign();
	const displayed = usage !== "none";
	const hideNumDefects = jobType === "Matching" || jobType === "Camera";
	const uploadEnable = useUploadEnable();

	if (isTestRun) {
		return (
			<Stack spacing={1} margin={1}>
				<JobTypeTypography />
				{!hideNumDefects && (
					<Stack direction="row">
						<NumDefectsTextField />
					</Stack>
				)}
				{!noDesign &&
					(enableImported ? (
						<ImportedParam isTestRun />
					) : (
						<CustomParam isReadonly />
					))}
			</Stack>
		);
	}

	return (
		<Stack
			direction="column"
			p={1}
			sx={{ height: "100%", width: "100%" }}
			spacing={1}
		>
			<Stack direction="row" spacing={2} alignItems="baseline">
				<JobTypeSelect />
				<DesignSwitch checked={checked} hidden={usage !== "optional"} />
				<CommentTextField />
			</Stack>
			{!hideNumDefects && (
				<Stack
					direction="row"
					spacing={2}
					alignItems="baseline"
					sx={{ display: "flex" }}
				>
					<NumDefectsTextField />
				</Stack>
			)}

			{displayed && <DesignTypeSelect disabled={noDesign} />}
			{displayed &&
				(enableImported ? (
					<ImportedParam disabled={noDesign} />
				) : (
					<CustomParam isReadonly={noDesign} />
				))}
			{uploadEnable && <UploadParams isReadonly={noDesign} />}
		</Stack>
	);
};
