import { Stack } from "@mui/material";

import {
	DesignLayerDataGrid,
	ImportedLayerSetting,
	OffsetXY,
} from "../components/imported";

export interface ImportedParamProps {
	isTestRun?: boolean;
	disabled?: boolean;
}

export const ImportedParam = ({
	isTestRun,
	disabled,
}: ImportedParamProps): JSX.Element => {
	return (
		<Stack spacing={2}>
			<Stack direction="row" spacing={1}>
				<ImportedLayerSetting isReadonly={isTestRun || disabled} />
				<OffsetXY isReadonly={isTestRun || disabled} />
			</Stack>
			<DesignLayerDataGrid isTestRun={isTestRun} disabled={disabled} />
		</Stack>
	);
};
