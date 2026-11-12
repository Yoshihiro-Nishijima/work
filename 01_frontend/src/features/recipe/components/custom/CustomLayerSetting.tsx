import { Stack } from "@mui/material";
import { useMemo } from "react";

import { Fieldset } from "~/components/layouts";

import { PitchXY, ShiftXY, SizeXY } from ".";
import type { IsReadonlyProp } from "../../types";

export const CustomLayerSetting = ({
	isReadonly = false,
}: IsReadonlyProp): JSX.Element => {
	return useMemo(
		() => (
			<Fieldset legend="Layout Setting">
				<Stack direction="row" spacing={1}>
					<SizeXY isReadonly={isReadonly} />
					<PitchXY isReadonly={isReadonly} />
					<ShiftXY isReadonly={isReadonly} />
				</Stack>
			</Fieldset>
		),
		[isReadonly],
	);
};
