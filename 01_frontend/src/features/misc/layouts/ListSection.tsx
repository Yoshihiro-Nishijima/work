import { Box } from "@mui/material";
import { useMemo } from "react";

import { Tabs } from "~/components/layouts";
import { IntegratedDefectDataGrid } from "~/features/defect-list/layouts/IntegratedDefectDataGrid";
import { INTEGRATED_VIEWER_MAP_TITLEBAR_HEIGHT } from "~/features/integrated-viewer-map/hooks/useMapAreaInfo";
import { useResultJobType } from "~/features/misc/hooks/useResultsJobType";
import { SFovDataGrid } from "~/features/s-fov-list/components/SFovDataGrid";

import {
	DEFECT_LIST_TABIDX,
	SFOV_LIST_TABIDX,
	useListSectionTabIdx,
} from "../hooks/useListSectionTabIdx";

const tabStyle = {
	minHeight: "34px",
	height: "34px",
};

export const ListSection = (): JSX.Element => {
	const { enableDefect } = useResultJobType();
	const { listSectionTabIdx, setListSectionTabIdx } = useListSectionTabIdx();

	const defectPanels = useMemo(
		() => [
			<SFovDataGrid key={SFOV_LIST_TABIDX} />,
			<IntegratedDefectDataGrid key={DEFECT_LIST_TABIDX} />,
		],
		[],
	);

	const sfovOnlyPanels = useMemo(
		() => [<SFovDataGrid key={SFOV_LIST_TABIDX} />],
		[],
	);

	return (
		<Box sx={{ ml: 7.2, height: "100%" }}>
			<Box height={INTEGRATED_VIEWER_MAP_TITLEBAR_HEIGHT} />
			<Box style={{ overflow: "hidden" }} sx={{ height: "100%" }}>
				{enableDefect ? (
					<Tabs
						labels={["s FOV", "Defect"]}
						panels={defectPanels}
						initIdx={0}
						style={{ height: `calc(100% - ${tabStyle.height})` }}
						isCentered={false}
						tabStyle={tabStyle}
						setCurrentIdx={setListSectionTabIdx}
						currentIdx={listSectionTabIdx}
					/>
				) : (
					<Tabs
						labels={["s FOV"]}
						panels={sfovOnlyPanels}
						initIdx={0}
						style={{ height: `calc(100% - ${tabStyle.height})` }}
						isCentered={false}
						tabStyle={tabStyle}
					/>
				)}
			</Box>
		</Box>
	);
};
