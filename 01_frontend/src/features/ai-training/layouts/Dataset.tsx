import { Box } from "@mui/material";
import { Tabs } from "~/components/layouts";
import { CreateDatasetView } from "../components/CreateDatasetView";
import { OptionView } from "../components/OptionView";

export const Dataset = (): JSX.Element => {
	return (
		<Box sx={{ height: "100%", width: "100%" }}>
			<Tabs
				labels={["CREATE NEW DATASET", "OPTION"]}
				panels={[<CreateDatasetView key={0} />, <OptionView key={1} />]}
				disabledIndices={[1]}
				uiVariant="inherit"
				isCentered={false}
			/>
		</Box>
	);
};
