import { Stack, TextField } from "@mui/material";
import { type ChangeEvent, useRef, useState } from "react";

import { LabeledFormGrid } from "~/components/elements";
import { Fieldset } from "~/components/layouts";
import { VALID_ERROR_MESSAGE } from "~/config";
import {
	useDesignDataList,
	useImportedParam,
} from "~/features/recipe/hooks/useImportedParam";

import { ListBox } from "~/components/elements/ListBox";
import type { IsReadonlyProp } from "../../types";

export const ImportedLayerSetting = ({
	isReadonly = false,
}: IsReadonlyProp): JSX.Element => {
	const { designDataList, fetchDesignDataList } = useDesignDataList();
	const { designData, cellName, setDesignData, setCellName } =
		useImportedParam();

	const [cellNameError, setCellNameError] = useState(false);
	const cellNameRef = useRef<HTMLInputElement>(null);
	const handleCellNameChange = (
		e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
	): void => {
		setCellName(e.target.value);
		if (cellNameRef.current != null) {
			setCellNameError(!cellNameRef.current.validity.valid);
		}
	};

	return (
		<Fieldset legend="Layout Setting">
			<Stack width="300px">
				<LabeledFormGrid label="Design Data" labelXs={4}>
					<ListBox
						text={designData ?? ""}
						setText={setDesignData}
						selectOptions={designDataList}
						isReadonly={isReadonly}
						onOpen={fetchDesignDataList}
					/>
				</LabeledFormGrid>
				<LabeledFormGrid label="Cell Name" labelXs={4}>
					<TextField
						sx={{ width: "100%" }}
						value={cellName ?? ""}
						onChange={handleCellNameChange}
						error={cellNameError}
						inputProps={{ pattern: "^[a-zA-Z_0-9\\-]+$", maxLength: 40 }}
						inputRef={cellNameRef}
						helperText={cellNameError ? VALID_ERROR_MESSAGE : ""}
						disabled={isReadonly}
					/>
				</LabeledFormGrid>
			</Stack>
		</Fieldset>
	);
};
