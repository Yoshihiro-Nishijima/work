// SFOV View SFOV表示エリア管理

import { Stack } from "@mui/material";
import { useMfovnoForSEMImage } from "~/features/map/hooks/useMfovnoForSEMImage";
import { useSfovnoForSEMImage } from "~/features/map/hooks/useSfovnoForSEMImage";
import { SFovView } from "../components/SFovView";
import { SFovViewToolBar } from "../components/SFovViewToolBar";

export const SFovViewImage = (): JSX.Element => {
	const { mfovnoForSEMImage } = useMfovnoForSEMImage();
	const { sfovnoForSEMImage } = useSfovnoForSEMImage();

	return (
		<Stack sx={{ border: 1, height: "100%", bgcolor: "white" }}>
			<SFovViewToolBar />
			<Stack height="calc(100% - 100px)">
				{" "}
				{/* タイトルバー(30px)+Toolbar(70px)の高さ分引く */}
				<SFovView mfovno={mfovnoForSEMImage} sfovno={sfovnoForSEMImage} />
			</Stack>
		</Stack>
	);
};
