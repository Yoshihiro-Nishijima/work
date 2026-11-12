import { Box, Button } from "@mui/material";

import { getTestRunURL } from "~/config";
import { useSFovViewModal } from "~/features/integrated-viewer-sfov-view/hooks/useSFovViewModal";
import { useResultName } from "~/features/misc/hooks/useResultName";
import { useSelectedDefect } from "~/features/misc/hooks/useSelectedDefect";
import { useFovList } from "~/features/s-fov-list/hooks/useFovList";

export const ControlButton = (): JSX.Element => {
	const { resultName } = useResultName();
	const { updateSFovViewModalOpen } = useSFovViewModal();
	const { selectedFov } = useFovList();
	const { selectedDefect } = useSelectedDefect();

	const isDisabled = selectedFov == null && selectedDefect == null;

	// SFovViewウインドウオープンイベント
	const handleClickSFovViewModalOpen = (): void => {
		updateSFovViewModalOpen(true);
	};

	// TestRunウィンドウオープンイベント
	const handleClickTestRunOpen = (): void => {
		const mfovno = selectedFov?.mfovno ?? selectedDefect?.mFOVno ?? 0;
		const sfovno = selectedFov?.sfovno ?? selectedDefect?.sFOVno ?? 0;

		mfovno !== 0 &&
			sfovno !== 0 &&
			window.open(getTestRunURL(resultName, mfovno, sfovno), "Test Run");
	};

	return (
		<Box sx={{ borderTop: 1, borderColor: "text.disabled" }}>
			<Button
				disabled={isDisabled}
				variant="outlined"
				onClick={handleClickSFovViewModalOpen}
				sx={{ m: 1, fontSize: "0.5rem" }}
			>
				sFOV View
			</Button>
			<Button
				disabled={isDisabled}
				variant="outlined"
				onClick={handleClickTestRunOpen}
				sx={{ m: 1, fontSize: "0.5rem" }}
			>
				Test Run
			</Button>
		</Box>
	);
};
