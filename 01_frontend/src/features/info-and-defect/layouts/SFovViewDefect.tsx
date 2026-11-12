import { Stack } from "@mui/material";

import { TitleBar } from "~/components/elements";

import { DefectDataGrid } from "../components/DefectDataGrid";

export const SFovViewDefect = (): JSX.Element => {
	const heightCollectionValue = "calc(100% - 54px)"; // 表示位置をずらしている分高さを引く

	return (
		<Stack sx={{ height: "100%" }}>
			<TitleBar title="Defect" sx={{ height: 24 }} />
			<DefectDataGrid
				sx={{ height: heightCollectionValue, backgroundColor: "white" }}
			/>
		</Stack>
	);
};
