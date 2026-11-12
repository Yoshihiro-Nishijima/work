import { Stack } from "@mui/material";

import {
	CategorySelect,
	CustomLayerSetting,
	ToneSelect,
} from "../components/custom";
import type { IsReadonlyProp } from "../types";

export const CustomParam = ({
	isReadonly = false,
}: IsReadonlyProp): JSX.Element => {
	return (
		<Stack direction="column" p={1} sx={{ height: "100%" }} spacing={1}>
			<Stack direction="row" spacing={2} alignItems="baseline">
				<CategorySelect isReadonly={isReadonly} />
				<ToneSelect isReadonly={isReadonly} />
			</Stack>
			<CustomLayerSetting isReadonly={isReadonly} />
		</Stack>
	);
};
