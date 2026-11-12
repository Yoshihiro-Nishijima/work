import { Box, Button } from "@mui/material";
import { useMemo } from "react";

import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import { Tabs } from "~/components/layouts";
import { AI_TRAINING_VIEWER_PATH } from "~/config";
import { UserMenuBar } from "../../users/layouts/UserMenuBar";
import { Configuration } from "./Configuration";
import { JobManager } from "./JobManager";
import { Logs } from "./Logs";

export const HEADER_HEIGHT = "36px";
const TAB_STYLE = {
	minHeight: HEADER_HEIGHT,
	height: HEADER_HEIGHT,
};

// React.lazy を利用するため default export を使用する
const Management = (): JSX.Element => {
	document.title = "MB-MMI Management";

	const panels = useMemo(
		() => [<JobManager key={0} />, <Configuration key={1} />, <Logs key={2} />],
		[],
	);

	const openAITrainingViewer = () => {
		window.open(`${AI_TRAINING_VIEWER_PATH}`, "_blank");
	};

	return (
		<Box sx={{ height: "100vh", width: "100%" }}>
			<Tabs
				labels={["JobManager", "Configuration", "Logs"]}
				panels={panels}
				tabStyle={TAB_STYLE}
			/>
			<Button
				variant="text"
				startIcon={<OpenInNewIcon />}
				onClick={openAITrainingViewer}
				sx={{
					textTransform: "none",
					position: "absolute",
					top: 8,
					right: 150,
					color: "white",
					padding: "8px",
				}}
			>
				ADC Training
			</Button>
			<UserMenuBar />
		</Box>
	);
};
export default Management;
