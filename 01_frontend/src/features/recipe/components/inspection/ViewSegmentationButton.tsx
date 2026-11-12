import { Button } from "@mui/material";
import { Box } from "@mui/system";

import { getSegmentationURL } from "~/config";
import { useInspectionParam } from "~/features/recipe/hooks/useInspectionParam";

export const ViewSegmentationButton = (): JSX.Element => {
	const { model } = useInspectionParam();

	const openSegmentation = (): void => {
		window.open(getSegmentationURL(model));
	};

	return (
		<Box>
			<Button
				onClick={openSegmentation}
				variant="contained"
				disabled={model === ""}
			>
				View Segmentation
			</Button>
		</Box>
	);
};
