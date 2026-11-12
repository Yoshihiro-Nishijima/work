import AddIcon from "@mui/icons-material/Add";
import { Button, Tooltip } from "@mui/material";
import { GridRowModes, GridToolbarContainer } from "@mui/x-data-grid-pro";

import { randomId } from "../hooks";
import type { EditToolbarProps } from "../types";
import { MAX_DESTINATION_NUM } from "./UploadDestinationGrid";

export const EditToolbar = (props: EditToolbarProps): JSX.Element => {
	const { setRows, setRowModesModel, disabled } = props;

	const addClicked = (): void => {
		const id = randomId();
		setRows((oldRows) => [
			...oldRows,
			{ id, name: "", ipAddr: "", dir: "", isNew: true },
		]);
		setRowModesModel((oldModel) => {
			return {
				...oldModel,
				[id]: { mode: GridRowModes.Edit, fieldToFocus: "name" },
			};
		});
	};
	const msg = `The Max Number of Destination is ${MAX_DESTINATION_NUM}`;
	return (
		<GridToolbarContainer sx={{ justifyContent: "right" }}>
			<Tooltip title={msg}>
				<Button
					// ToolTipを使うと aria-label にtitleがセットされてしまい
					// ユニットテストの要素取得で困るので明示的にボタンラベルを指定しておく
					aria-label="Add destination"
					color="primary"
					startIcon={<AddIcon />}
					onClick={addClicked}
					disabled={disabled != null && disabled}
				>
					Add destination
				</Button>
			</Tooltip>
		</GridToolbarContainer>
	);
};
