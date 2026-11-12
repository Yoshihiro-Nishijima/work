import { Stack } from "@mui/material";

import { TitleBar } from "~/components/elements";

import { DefectDataGrid } from "../components/DefectDataGrid";
import { ImageInfoDataGrid } from "../components/ImageInfoDataGrid";

export const InfoAndDefect = (): JSX.Element => {
	return (
		<Stack sx={{ height: "100%", width: "100%" }}>
			<TitleBar title="ImageInfo" sx={{ height: 24 }} />
			<ImageInfoDataGrid />
			<TitleBar title="Defect" sx={{ height: 24 }} />
			{/* ImageInfo部とタイトルバーの高さを引く(内訳：ImageInfo=130、Titlebar=24*2) */}
			<DefectDataGrid sx={{ height: "calc(100% - 178px)" }} />
		</Stack>
	);
};
