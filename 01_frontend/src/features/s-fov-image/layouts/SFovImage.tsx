import { Stack } from "@mui/system";

import { TitleBar } from "~/components/elements";

import { useMfovnoForSEMImage } from "~/features/map/hooks/useMfovnoForSEMImage";
import { useSfovnoForSEMImage } from "~/features/map/hooks/useSfovnoForSEMImage";
import { Menu } from "../components/Menu";
import { SFovView } from "../components/SFovView";

export const SFovImage = (): JSX.Element => {
	const { mfovnoForSEMImage } = useMfovnoForSEMImage();
	const { sfovnoForSEMImage } = useSfovnoForSEMImage();

	return (
		<Stack sx={{ width: "100%", height: "100%" }}>
			<TitleBar title="s FOV Image" sx={{ height: 24 }} />
			<Menu />
			<SFovView mfovno={mfovnoForSEMImage} sfovno={sfovnoForSEMImage} />
		</Stack>
	);
};
