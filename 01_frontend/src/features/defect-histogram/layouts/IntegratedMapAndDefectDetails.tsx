import { Box } from "@mui/material";
import { Allotment } from "allotment";

import { IntegratedMap } from "~/features/integrated-viewer-map/layouts/IntegratedMap";

import { DefectHistogramPanel } from "../components/DefectHistogramPanel";
import { useDefectHistogramPanel } from "../hooks/useDefectHistogram";

export const IntegratedMapAndDefectDetails = (): JSX.Element => {
	const { visible: histogramVisible } = useDefectHistogramPanel();

	return (
		<Box sx={{ width: "100%", height: "100%", minHeight: 0 }}>
			<Allotment vertical>
				<Allotment.Pane minSize={180}>
					<IntegratedMap />
				</Allotment.Pane>
				{histogramVisible && (
					<Allotment.Pane preferredSize={480} minSize={280}>
						<DefectHistogramPanel />
					</Allotment.Pane>
				)}
			</Allotment>
		</Box>
	);
};
