import { Stack } from "@mui/system";

import { BlurParams } from "./TraininableD2D/BlurParams";
import { BrightnessParams } from "./TraininableD2D/BrightnessParams";
import { ReExecuteSegmentationButton } from "./TraininableD2D/ReExecuteSegmentationButton";
import { SegmentationParams } from "./TraininableD2D/SegmentationParams";
import { TrainingCountParams } from "./TraininableD2D/TrainingCountParams";
import { ZoomParams } from "./TraininableD2D/ZoomParams";

export const TrainingParametersD2D = (prop: {
	isBaseModelUsing?: boolean;
}): JSX.Element => {
	return (
		<Stack direction="row" spacing={4}>
			<Stack>
				<TrainingCountParams />
				<BrightnessParams />
				<BlurParams />
				<ZoomParams />
			</Stack>
			<Stack spacing={2}>
				<SegmentationParams />
				<ReExecuteSegmentationButton isBaseModelUsing={prop.isBaseModelUsing} />
			</Stack>
		</Stack>
	);
};
