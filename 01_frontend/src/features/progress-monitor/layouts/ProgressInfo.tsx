import { Box } from "@mui/material";

import { Tabs } from "~/components/layouts";
import { DeleteProgressDataGrid } from "../components/DeleteProgressDataGrid";
import { JobProgressDataGrid } from "../components/JobProgressDataGrid";

const HEADER_HEIGHT = "36px";
const TAB_STYLE = {
	minHeight: HEADER_HEIGHT,
	height: HEADER_HEIGHT,
};
const PANEL_STYLE = {
	height: `calc(100% - ${HEADER_HEIGHT})`,
};

export const ProgressInfo = (): JSX.Element => {
	return (
		<Box sx={{ height: "100%", width: "100%" }}>
			<Tabs
				labels={["Progress Monitor", "Delete Monitor"]}
				panels={[
					<JobProgressDataGrid key="progress" />,
					<DeleteProgressDataGrid key="delete" />,
				]}
				initIdx={0}
				style={PANEL_STYLE}
				tabStyle={TAB_STYLE}
			/>
		</Box>
	);
};
