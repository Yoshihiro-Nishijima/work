import { Box } from "@mui/material";
import { useMemo } from "react";

import { Tabs } from "~/components/layouts";

import { TrainableDataGrid } from "../components/TrainableDataGrid";
import { useModelDataGridTabIdx } from "../hooks/useModelDataGridTabIdx";

const HEADER_HEIGHT = "36px";
const TAB_STYLE = {
	minHeight: HEADER_HEIGHT,
	height: HEADER_HEIGHT,
};
const PANEL_STYLE = {
	height: `calc(100% - ${HEADER_HEIGHT})`,
};

export const ModelDataGridTab = (): JSX.Element => {
	const { modelDataGridTabIdx, setModelDataGridTabIdx } =
		useModelDataGridTabIdx();

	const panels = useMemo(
		() => [
			<TrainableDataGrid key={1} type="D2D" />,
			<TrainableDataGrid key={2} type="D2DB" />,
		],
		[],
	);

	return (
		<Box sx={{ height: "100%", width: "100%" }}>
			{/** tabに配置する順番は useModelDataGridTabIdxの定数 xxx_TABIDX に合わせること */}
			<Tabs
				labels={["Trainable D2D", "Trainable D2DB"]}
				panels={panels}
				style={PANEL_STYLE}
				tabStyle={TAB_STYLE}
				initIdx={0}
				currentIdx={modelDataGridTabIdx}
				setCurrentIdx={setModelDataGridTabIdx}
			/>
		</Box>
	);
};
