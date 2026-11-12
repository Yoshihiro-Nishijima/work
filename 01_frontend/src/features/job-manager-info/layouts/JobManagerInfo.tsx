import { Box } from "@mui/material";
import { useMemo } from "react";

import { Tabs } from "~/components/layouts";
import { useJobManagerInfoTabIdx } from "~/features/job-manager-info/hooks/useJobManagerInfoTabIdx";

import { DesignDataGrid } from "../components/DesignDataGrid";
import { NodeDataGrid } from "../components/NodeDataGrid";
import { ResultsDataGrid } from "../components/ResultsDataGrid";
import { ToolDataDataGrid } from "../components/ToolDataDataGrid";
import { ModelDataGridTab } from "./ModelDataGridTab";

// Resultsタブのインデクス
const RESULTS_IDX = 1;
// 初期表示タブのインデクス
const INIT_IDX = 1;
// Modelタブのインデクス
const MODEL_IDX = 2;

const HEADER_HEIGHT = "36px";
const TAB_STYLE = {
	minHeight: HEADER_HEIGHT,
	height: HEADER_HEIGHT,
};
const PANEL_STYLE = {
	height: `calc(100% - ${HEADER_HEIGHT})`,
};
export function JobManagerInfo(): JSX.Element {
	const { setTabIdx } = useJobManagerInfoTabIdx(
		INIT_IDX,
		RESULTS_IDX,
		MODEL_IDX,
	);

	const panels = useMemo(
		() => [
			<ToolDataDataGrid key={0} />,
			<ResultsDataGrid key={1} />,
			<ModelDataGridTab key={2} />,
			<DesignDataGrid key={3} />,
			<NodeDataGrid key={4} />,
		],
		[],
	);

	return (
		<Box sx={{ height: "100%", width: "100%" }}>
			<Tabs
				labels={["TOOL DATA", "RESULTS", "MODEL", "DESIGN", "NODE"]}
				panels={panels}
				setIdxAction={setTabIdx}
				initIdx={INIT_IDX}
				style={PANEL_STYLE}
				tabStyle={TAB_STYLE}
			/>
		</Box>
	);
}
