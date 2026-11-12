import { Box } from "@mui/system";

import { DisplaySetting } from "~/features/display-setting/layouts/DisplaySetting";
import { UploadSettings } from "~/features/upload-config/layouts/UploadConfig";

export const Configuration = (): JSX.Element => {
	return (
		<Box sx={{ height: "100vh", width: "100%" }}>
			<UploadSettings />
			<DisplaySetting />
		</Box>
	);
};
