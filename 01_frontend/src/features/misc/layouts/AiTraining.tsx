import "allotment/dist/style.css";

import { Box } from "@mui/material";
import { Allotment } from "allotment";
import { TitleBar } from "~/components/elements";
import { Dataset } from "~/features/ai-training/layouts/Dataset";
import { ModelManager } from "~/features/ai-training/layouts/ModelManager";
import { UserMenuBar } from "~/features/users/layouts/UserMenuBar";

export const AiTraining = (): JSX.Element => {
	document.title = "AI Training Management";
	return (
		<>
			<TitleBar
				title="AI Training Management"
				sx={{ height: 40, paddingTop: 1 }}
			/>
			<Box
				sx={{ height: "calc(100vh - 40px)", width: "100%", overflow: "hidden" }}
			>
				<Allotment vertical defaultSizes={[50, 50]}>
					<Allotment.Pane minSize={80}>
						<ModelManager />
					</Allotment.Pane>
					<Allotment.Pane minSize={80}>
						<Dataset />
					</Allotment.Pane>
				</Allotment>
			</Box>
			<UserMenuBar top={4} />
		</>
	);
};
export default AiTraining;
