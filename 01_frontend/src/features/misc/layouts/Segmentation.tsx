import "allotment/dist/style.css";

import { Box } from "@mui/system";
import { Allotment } from "allotment";

import { TitleBar } from "~/components/elements";
import { SEGMENTATION_PATH } from "~/config";
import { useModel } from "~/features/misc/hooks/useModel";
import { SegmentationImageList } from "~/features/segmentation-image-list/layouts/SegmentationImageList";
import { SegmentationImage } from "~/features/segmentation-image/layouts/SegmentationImage";
import { getPathParams } from "~/utils/urlUtils";

function getModelName(): string {
	// URLパス /segmentation/{ModelName} から ModelName を取得
	const pathParams = getPathParams(`${SEGMENTATION_PATH}/`);
	return pathParams.length > 0 ? pathParams[0] : "";
}

// React.lazy を利用するため default export を使用する
const Segmentation = (): JSX.Element => {
	document.title = "Segmentation";

	const { setModel } = useModel();
	setModel(getModelName());

	return (
		<Box sx={{ width: "100%", height: "calc(100vh - 24px)" }}>
			<TitleBar title="Segmentation" sx={{ height: 24 }} />
			<Allotment>
				<Allotment.Pane maxSize={200}>
					<SegmentationImageList />
				</Allotment.Pane>
				<Allotment.Pane>
					<SegmentationImage />
				</Allotment.Pane>
			</Allotment>
		</Box>
	);
};

export default Segmentation;
