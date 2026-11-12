import ChecklistIcon from "@mui/icons-material/Checklist";
import {
	Box,
	Button as MUIButton,
	Stack,
	ToggleButton,
	Typography,
	styled,
} from "@mui/material";
import {
	GridToolbarColumnsButton,
	GridToolbarContainer,
	GridToolbarFilterButton,
} from "@mui/x-data-grid-pro";
import { useAtomValue } from "jotai";
import { useState } from "react";

import {
	selectedSFovImageIdSetReadAtom,
	useSelectedSFovImageIdList,
} from "~/features/misc/hooks/useSelectedSFovImageIdList";

import { useFovFilter } from "../hooks/useFovFilter";
import { useFovList } from "../hooks/useFovList";
import { usePickedFov } from "../hooks/usePickedFov";

// MUIのツールバーのボタンを無効にした際にツールチップを表示しようとして警告が出る対策
const Button = styled(MUIButton)(() => ({
	"&.Mui-disabled": {
		pointerEvents: "auto",
	},
}));

export const SFovDataGridForTrainingToolbar = (): JSX.Element => {
	const { fovList } = useFovList();
	const { addAll, removeAll } = useSelectedSFovImageIdList();
	const [selectedPicked, setSelectedPicked] = useState(false);
	const { setPickedFovState } = usePickedFov();
	const selectedSFovImageIdList = useAtomValue(selectedSFovImageIdSetReadAtom);
	const { filter } = useFovFilter();

	const isButtonDisabled = fovList.length === 0;
	const isPickedDisabled =
		filter.items.length > 0 ||
		(!selectedPicked && selectedSFovImageIdList.size === 0);

	// SellectAllボタンクリックイベント
	const handleClickSelectAll = (): void => {
		// sFOVリスト上の全選択処理をCall
		addAll();
	};

	// ClearAllボタンクリックイベント
	const handleClickClearAll = (): void => {
		// sFOVリスト上の全解除処理（画面表示範囲）をCall
		removeAll();
	};

	// Pickedボタンクリックイベント
	const handleChangePicked = (): void => {
		const newSelectedPicked = !selectedPicked;
		// トグル切替
		setSelectedPicked(newSelectedPicked);
		// picked機能対応fov状態更新
		setPickedFovState(newSelectedPicked);
	};

	return (
		<GridToolbarContainer>
			<Box>
				<Box>
					<GridToolbarColumnsButton />
					<GridToolbarFilterButton
						PopperProps={{
							sx: {
								"& .MuiTooltip-tooltip": {
									fontSize: "1em",
								},
							},
						}}
						componentsProps={{
							button: { disabled: selectedPicked },
						}}
					/>
					<ToggleButton
						value="check"
						disabled={isPickedDisabled}
						selected={selectedPicked}
						onChange={handleChangePicked}
						color="primary"
						sx={{ height: 24, width: 95 }}
						aria-label="Picked"
					>
						<ChecklistIcon />
						<Typography sx={{ ml: 1, textTransform: "none" }}>
							Picked
						</Typography>
					</ToggleButton>
				</Box>
				<Stack
					spacing={2}
					direction="row"
					sx={{ height: 26, alignItems: "center" }}
				>
					<Button
						disabled={isButtonDisabled}
						variant="contained"
						onClick={handleClickSelectAll}
						sx={{ ml: 1, width: 120, height: 24, textTransform: "none" }}
						aria-label="SelectAll"
					>
						SelectAll
					</Button>
					<Button
						disabled={isButtonDisabled}
						variant="contained"
						onClick={handleClickClearAll}
						sx={{ ml: 1, width: 120, height: 24, textTransform: "none" }}
						aria-label="ClearAll"
					>
						ClearAll
					</Button>
				</Stack>
			</Box>
		</GridToolbarContainer>
	);
};
