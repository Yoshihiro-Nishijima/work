import { Stack } from "@mui/material";

import {
	ClippingSetting,
	DefectFilterSetting,
	DefectGroupSetting,
	DetectionSetting,
	Preprocessing,
	SegmentationSetting,
} from "../components/inspection";
import { DefectFeatureExtractionSetting } from "../components/inspection/DefectFeatureExtractionSetting";

interface InspectionParamProps {
	isDetectionModelReadonly?: boolean;
}

export const InspectionParam = ({
	isDetectionModelReadonly = false,
}: InspectionParamProps): JSX.Element => {
	return (
		<Stack spacing={1} m={2} width="540px">
			<Preprocessing />
			<DetectionSetting isModelReadonly={isDetectionModelReadonly} />
			<DefectFeatureExtractionSetting />
			<Stack direction="row" spacing={1}>
				<DefectGroupSetting />
				<ClippingSetting />
			</Stack>
			<DefectFilterSetting />
			<SegmentationSetting />
		</Stack>
	);
};
