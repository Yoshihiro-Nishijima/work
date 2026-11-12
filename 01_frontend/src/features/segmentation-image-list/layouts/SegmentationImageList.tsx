import { Box } from "@mui/material";

import { SegmentationImageDataGrid } from "~/features/segmentation-image-list/components/SegmentationImageDataGrid";

export const SegmentationImageList = (): JSX.Element => {
	return (
		<Box sx={{ width: "100%", height: "100%" }}>
			<SegmentationImageDataGrid />
		</Box>
	);
};
