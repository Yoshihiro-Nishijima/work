import { Stack } from "@mui/material";

import { Fieldset } from "~/components/layouts";
import { useInspectionParam } from "~/features/recipe/hooks/useInspectionParam";
import { useJobType } from "~/features/recipe/hooks/useRecipeCommonParam";
import { useSegmentation } from "~/features/recipe/hooks/useSegmentation";

import { SegmentationGrid, ViewSegmentationButton } from ".";

export const SegmentationSetting = (): JSX.Element | undefined => {
	const jobType = useJobType();
	const { model } = useInspectionParam();
	const { exec } = useSegmentation(model);

	if (jobType !== "Trainable D2D" || !exec) return undefined;

	return (
		<Fieldset legend="Segmentation Setting">
			<Stack spacing={1}>
				<ViewSegmentationButton />
				<SegmentationGrid />
			</Stack>
		</Fieldset>
	);
};
