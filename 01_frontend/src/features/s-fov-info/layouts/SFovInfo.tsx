import { Box } from "@mui/material";

import { SFovInfoDataGrid } from "../components/SFovInfoDataGrid";

/** sFOV付帯情報(テーブルに背景白色・黒枠線を追加したもの) */
export const SFovInfo = (): JSX.Element => {
	return (
		<Box
			data-testid="sfovinfo-root"
			sx={{ height: "100%", bgcolor: "white", borderTop: 1, borderBottom: 1 }}
		>
			<SFovInfoDataGrid />
		</Box>
	);
};
