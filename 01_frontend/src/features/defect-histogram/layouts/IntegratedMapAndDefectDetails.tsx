import { Box } from "@mui/material";
import { Allotment } from "allotment";

import { TitleBar } from "~/components/elements";
import { ClassifiedDataGrid } from "~/features/classified-result/components/ClassifiedDataGrid";
import { IntegratedMap } from "~/features/integrated-viewer-map/layouts/IntegratedMap";

import { DefectHistogramPanel } from "../components/DefectHistogramPanel";
import { useDefectHistogramPanel } from "../hooks/useDefectHistogram";

export const IntegratedMapAndDefectDetails = (): JSX.Element => {
	const { visible: histogramVisible } = useDefectHistogramPanel();

	const lowerPanel = histogramVisible ? (
		<DefectHistogramPanel />
	) : (
		<Box sx={{ height: "100%", minHeight: 0 }}>
			<TitleBar title="Classified Result" sx={{ height: 24 }} />
			<ClassifiedDataGrid />
		</Box>
	);

	return (
		<Box sx={{ width: "100%", height: "100%", minHeight: 0 }}>
			<Allotment vertical>
				<Allotment.Pane minSize={180}>
					<IntegratedMap />
				</Allotment.Pane>
				<Allotment.Pane preferredSize={480} minSize={280}>
					{lowerPanel}
				</Allotment.Pane>
			</Allotment>
		</Box>
	);
};
