import "allotment/dist/style.css";
import { Box, Divider } from "@mui/material";
import { Allotment } from "allotment";
import { TitleBar } from "~/components/elements";
import { ADC_ANNOTATION_VIEWER_PATH } from "~/config";
import { ADCDatasetDataGrid } from "~/features/adc-annotation/components/ADCDatasetDataGrid";
import { ADCHelpButton } from "~/features/adc-annotation/components/ADCHelpButton";
import { ADCImageList } from "~/features/adc-annotation/components/ADCImageList";
import { useDataset } from "~/features/adc-annotation/hooks/useDataset";
import { ADCToolBar } from "~/features/adc-annotation/layouts/ADCToolBar";
import { UserMenuBar } from "~/features/users/layouts/UserMenuBar";
import { getPathParams } from "~/utils/urlUtils";

function getDatasetName(): string {
	// URLパス /adc-annotation/{DatasetName} から DatasetName を取得
	const pathParams = getPathParams(`${ADC_ANNOTATION_VIEWER_PATH}/`);
	return pathParams.length > 0 ? pathParams[0] : "";
}

export const ADCAnnotation = (): JSX.Element => {
	const datasetName = getDatasetName();
	const { setDatasetName, setDatasetType } = useDataset();
	document.title = "ADC Annotation";
	setDatasetName(datasetName);
	setDatasetType("ADC");

	return (
		<>
			<TitleBar
				title={`ADC Annotation / ${datasetName}`}
				sx={{ height: 40, paddingTop: 1 }}
			/>
			<Box
				sx={{ height: "calc(100vh - 40px)", width: "100%", overflow: "hidden" }}
			>
				<Allotment defaultSizes={[50, 50]}>
					<Allotment.Pane minSize={300}>
						<ADCDatasetDataGrid />
					</Allotment.Pane>
					<Allotment.Pane minSize={300}>
						<ADCToolBar />
						<Divider variant="middle" />
						<ADCImageList />
					</Allotment.Pane>
				</Allotment>
			</Box>
			<ADCHelpButton />
			<UserMenuBar top={4} />
		</>
	);
};
export default ADCAnnotation;
