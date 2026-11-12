import { Stack } from "@mui/material";

import { TitleBar } from "~/components/elements";
import { DefectDataGrid } from "~/features/info-and-defect/components/DefectDataGrid";
import { DefectInfoTable } from "~/features/info-and-defect/components/DefectInfoTable";

import { TestRunImageInfoDataGrid } from "../components/TestRunImageInfoDataGrid";

export const TestRunInfoAndDefect = (): JSX.Element => {
	return (
		<Stack sx={{ height: "100vh", width: "100%" }}>
			<TestRunImageInfoDataGrid />
			<TitleBar title="Defect Info" sx={{ height: 24 }} />
			<DefectInfoTable />
			<TitleBar title="Defects" sx={{ height: 24 }} />
			{/* ImageInfo部とDefectInfo部、タイトルバーの高さを引く
      (内訳：ImageInfoTitle=40、ImageInfo=258、DefectInfo=130、Titlebar=24*2) */}
			<DefectDataGrid sx={{ height: "calc(100% - 460px)" }} />
		</Stack>
	);
};
