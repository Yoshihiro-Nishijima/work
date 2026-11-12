import Delete from "@mui/icons-material/Delete";
import Undo from "@mui/icons-material/Undo";
import { Box, Button, Stack } from "@mui/material";
import { GridToolbarContainer } from "@mui/x-data-grid-pro";

import { useReviewSFov } from "~/features/training-mode-sfov-view/hooks/useReviewModal";

export const SFovDataGridForTrainingReviewToolbar = (): JSX.Element => {
	const {
		removeFromSelection,
		undoSelection,
		isUndoDisabled,
		isRemoveDisabled,
	} = useReviewSFov();

	// Undoボタンクリックイベント
	const handleClickUndo = (): void => {
		undoSelection();
	};

	// Removeボタンクリックイベント
	const handleClickRemove = (): void => {
		removeFromSelection();
	};

	return (
		<GridToolbarContainer>
			<Box>
				<Stack
					spacing={2}
					direction="row"
					sx={{ height: 26, alignItems: "center" }}
				>
					<Button
						disabled={isUndoDisabled}
						variant="contained"
						onClick={handleClickUndo}
						sx={{ ml: 1, width: 120, height: 24, textTransform: "none" }}
					>
						<Undo />
						Undo
					</Button>
					<Button
						disabled={isRemoveDisabled}
						variant="contained"
						onClick={handleClickRemove}
						sx={{ ml: 1, width: 120, height: 24, textTransform: "none" }}
					>
						<Delete />
						Remove
					</Button>
				</Stack>
			</Box>
		</GridToolbarContainer>
	);
};
