import { Stack } from "@mui/material";

import {
	AlignmentModeSelect,
	ErosionMitigationSelect,
	LayerTypeSelect,
	MatchingAreaSelect,
	MatchingMethodSelect,
	ReductionRatioSelect,
	SearchArea,
} from "../components/matching";
import { useNoDesign, useRecipeCommonParams } from "../hooks";

export const MatchingParam = (): JSX.Element => {
	const disabled = useNoDesign();
	const { designType } = useRecipeCommonParams();

	return (
		<Stack spacing={1} m={2} width="300px">
			{designType === "Imported" && <LayerTypeSelect disabled={disabled} />}
			<SearchArea disabled={disabled} />
			<MatchingAreaSelect disabled={disabled} />
			<MatchingMethodSelect disabled={disabled} />
			<ErosionMitigationSelect disabled={disabled} />
			<AlignmentModeSelect disabled={disabled} />
			<ReductionRatioSelect disabled={disabled} />
		</Stack>
	);
};
