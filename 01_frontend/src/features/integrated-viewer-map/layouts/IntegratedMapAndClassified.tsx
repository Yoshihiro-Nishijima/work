import { Box } from "@mui/material";
import { Allotment } from "allotment";
import { TitleBar } from "~/components/elements";

import { IntegratedMap } from "../layouts/IntegratedMap";
import { ClassifiedDataGrid } from "~/features/classified-result/components/ClassifiedDataGrid";

import { useMapAreaInfo } from "~/features/integrated-viewer-map/hooks/useMapAreaInfo";

export const IntegratedMapAndClassified = (): JSX.Element => {
	const { integratedMapAreaHeight, integratedMapAreaWidth } = useMapAreaInfo();

	return (
		<Box sx={{ width: "100%", height: "100%" }}>
				<Allotment vertical>
					<Allotment.Pane
						preferredSize
					>
						<IntegratedMap />
					</Allotment.Pane>

					<Allotment.Pane
						preferredSize
					>
						<TitleBar title="Classified Result" sx={{ height: 24 }} />
						<ClassifiedDataGrid	/>
				</Allotment.Pane>
			</Allotment>
		</Box>
	);
};
