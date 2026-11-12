// TestRunボタン

import { Button } from "@mui/material";

import { getTestRunURL } from "~/config";
import { useMfovnoForSEMImage } from "~/features/map/hooks/useMfovnoForSEMImage";
import { useSfovnoForSEMImage } from "~/features/map/hooks/useSfovnoForSEMImage";
import { useResultName } from "~/features/misc/hooks/useResultName";

export const TestRunButton = (): JSX.Element => {
	const { resultName } = useResultName();
	const { mfovnoForSEMImage } = useMfovnoForSEMImage();
	const { sfovnoForSEMImage } = useSfovnoForSEMImage();

	const openTestRun = (): void => {
		if (mfovnoForSEMImage == null || sfovnoForSEMImage == null) return;
		mfovnoForSEMImage !== 0 &&
			sfovnoForSEMImage !== 0 &&
			window.open(
				getTestRunURL(resultName, mfovnoForSEMImage, sfovnoForSEMImage),
				"Test Run",
			);
	};

	return (
		<Button variant="outlined" sx={{ m: 1, width: 100 }} onClick={openTestRun}>
			Test Run
		</Button>
	);
};
