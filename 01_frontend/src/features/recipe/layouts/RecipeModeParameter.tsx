import { Box, Stack } from "@mui/material";

import { Tabs } from "~/components/layouts";

import { useMemo } from "react";
import { ADCParam, CorrectionParam, InspectionParam, MatchingParam } from ".";
import { AreaList } from "../components/area";
import { useRecipeCommonParams } from "../hooks";

const LABELS = ["CORRECTION", "MATCHING", "INSPECTION", "ADC"];
const PANELS = [
	<CorrectionParam key={0} />,
	<MatchingParam key={1} />,
	<InspectionParam key={2} />,
	<ADCParam key={3} />,
];

export const RecipeModeParameter = (): JSX.Element => {
	const { modeTabIdxes } = useRecipeCommonParams();
	const labels = useMemo(
		() => LABELS.filter((_, idx) => modeTabIdxes.includes(idx)),
		[modeTabIdxes],
	);
	const panels = useMemo(
		() => PANELS.filter((_, idx) => modeTabIdxes.includes(idx)),
		[modeTabIdxes],
	);

	return (
		<Stack direction="row">
			<AreaList />
			<Box sx={{ height: "100%", width: "100%" }}>
				<Tabs labels={labels} panels={panels} />
			</Box>
		</Stack>
	);
};
