import { Stack } from "@mui/material";

import { Fieldset } from "~/components/layouts";

import {
	AbnormalitySlider,
	DefectDisplayList,
	GrayscaleDiffSlider,
	GrayscaleSlider,
	HeightSlider,
	LayerSetting,
	WidthSlider,
} from ".";

export const DefectFilterSetting = (): JSX.Element => {
	return (
		<Fieldset legend="Defect Filter Setting">
			<Stack direction="row">
				<DefectDisplayList />
				<Stack sx={{ height: "100%", width: "100%" }}>
					<AbnormalitySlider />
					<WidthSlider />
					<HeightSlider />
					<GrayscaleSlider />
					<GrayscaleDiffSlider />
					<LayerSetting />
				</Stack>
			</Stack>
		</Fieldset>
	);
};
