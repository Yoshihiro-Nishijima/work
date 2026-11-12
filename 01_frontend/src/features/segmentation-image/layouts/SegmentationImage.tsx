import { Stack } from "@mui/system";

import { SegmentationMenu } from "../components/SegmentationMenu";
import { SegmentationSEMImage } from "../components/SegmentationSEMImage";

export const SegmentationImage = (): JSX.Element => {
	return (
		<Stack sx={{ width: "100%", height: "100%" }}>
			<SegmentationMenu />
			<SegmentationSEMImage />
		</Stack>
	);
};
