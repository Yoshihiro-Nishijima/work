import { Box } from "@mui/material";

import { DefectDataGridList } from "../components/DefectDataGridList";
import { DefectDataGridThumbnail } from "../components/DefectDataGridThumbnail";
import { DefectDataGridThumbnailList } from "../components/DefectDataGridThumbnailList";
import { useDefectListView } from "../hooks/useDefectListView";

export const IntegratedDefectDataGrid = (): JSX.Element => {
	const { defectListView } = useDefectListView();
	return (
		<Box sx={{ height: "100%" }}>
			{defectListView === "list" && <DefectDataGridList />}
			{defectListView === "thumbnailList" && <DefectDataGridThumbnailList />}
			{defectListView === "thumbnail" && <DefectDataGridThumbnail />}
		</Box>
	);
};
