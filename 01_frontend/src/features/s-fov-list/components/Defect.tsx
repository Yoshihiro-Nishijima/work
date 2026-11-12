import { Stack, Typography } from "@mui/material";

import { useResultsRecord } from "~/features/misc/hooks/useResultName";

export const Defect = (): JSX.Element => {
	const { resultsRecord } = useResultsRecord();
	return (
		<Stack
			sx={{
				width: "310px",
				color: "white",
				backgroundColor: "primary.main",
				borderTopStyle: "solid",
				borderTopColor: "primary.dark",
				paddingLeft: 1,
			}}
		>
			<Typography variant="body2">
				Defect Count:{resultsRecord.defectCount}
			</Typography>
			<Typography variant="body2">
				Defect Density:{resultsRecord.defectDensity} / mm²
			</Typography>
		</Stack>
	);
};
