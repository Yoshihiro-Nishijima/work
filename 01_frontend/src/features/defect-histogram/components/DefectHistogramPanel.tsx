import { Box, Typography } from "@mui/material";
import { Button } from "@mui/material";

import { useDefectHistogram } from "../hooks/useDefectHistogram";
import { DefectHistogramItem } from "./DefectHistogramItem";

export const DefectHistogramPanel = (): JSX.Element => {
	const {
		items,
		removeHistogram,
		scheduleRange,
		fetchRange,
		resetRange,
		resetAllRanges,
		setLogYAxis,
	} = useDefectHistogram();

	return (
		<Box sx={{ height: "100%", minHeight: 0, overflow: "auto" }}>
			<Box
				sx={{
					display: "flex",
					alignItems: "center",
					justifyContent: "space-between",
					px: 1.5,
					py: 1,
				}}
			>
				<Typography variant="subtitle2">Defect Histogram</Typography>
				{items.length > 0 && (
					<Button size="small" onClick={resetAllRanges}>
						全体リセット
					</Button>
				)}
			</Box>
			{items.map((item) => (
				<DefectHistogramItem
					key={item.histogramId}
					item={item}
					onRemove={removeHistogram}
					onRangeChange={scheduleRange}
					onRangeCommit={fetchRange}
					onDetailsOpen={fetchRange}
					onReset={resetRange}
					onLogYAxisChange={setLogYAxis}
				/>
			))}
		</Box>
	);
};
