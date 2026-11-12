import { Stack } from "@mui/material";

import { CheckboxFieldSet } from "~/features/training-param-setting/components/CheckboxFieldSet";
import { LayerSelect, OverlapInput } from ".";
import {
	useInspectionParam,
	useSetInspectionParam,
} from "../../hooks/useInspectionParam";
import { useDesignType, useNoDesign } from "../../hooks/useRecipeCommonParam";
import { CoverageInput } from "./CoverageInput";

export const LayerSetting = (): JSX.Element => {
	const { layerEnabled } = useInspectionParam();
	const { setLayerEnabled } = useSetInspectionParam();
	const designType = useDesignType();

	const noDesign = useNoDesign();
	if (noDesign || designType !== "Imported") return <></>;
	return (
		<CheckboxFieldSet
			label="Layer"
			checked={layerEnabled}
			setChecked={setLayerEnabled}
		>
			<Stack>
				<LayerSelect />
				<CoverageInput />
				<OverlapInput />
			</Stack>
		</CheckboxFieldSet>
	);
};
