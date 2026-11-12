import { Box } from "@mui/material";

import { TitleBar } from "~/components/elements";
import { Defect } from "~/features/s-fov-list/components/Defect";

import { SFovDataGrid } from "../components/SFovDataGrid";

// Defect情報(<Defect/>)の高さ(34px)+sFOV Listタイトルバーの高さ(24px)
const SFOV_LIST_HEADER_HEIGHT = 58;

export const SFovList = (): JSX.Element => {
	return (
		<Box sx={{ width: "100%", height: "100%" }}>
			<Defect />
			<TitleBar title="s FOV list" sx={{ height: 24 }} />
			<SFovDataGrid
				height={`calc(100% - ${SFOV_LIST_HEADER_HEIGHT}px)`}
				isGetResultsRecord
			/>
		</Box>
	);
};
