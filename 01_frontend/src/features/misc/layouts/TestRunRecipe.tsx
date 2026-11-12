import { Box } from "@mui/material";
import { Allotment } from "allotment";
import { useEffect, useState } from "react";

import { Tabs } from "~/components/layouts";
import { RecipeCommonParameter } from "~/features/recipe";
import {
	useRecipeCommonParams,
	useRecipeModeParam,
	useSelectedAreaNo,
	useTestRunState,
} from "~/features/recipe/hooks";
import {
	ADCParam,
	CorrectionParam,
	InspectionParam,
	MatchingParam,
	ReTestRun,
} from "~/features/recipe/layouts";

const LABELS = ["CORRECTION", "MATCHING", "INSPECTION", "ADC"];
const PANELS = [
	<CorrectionParam key={0} />,
	<MatchingParam key={1} />,
	<InspectionParam key={2} isDetectionModelReadonly />,
	<ADCParam key={3} isModelReadonly />,
];

export const TestRunRecipe = (): JSX.Element => {
	const [labels, setLabels] = useState(LABELS);
	const [panels, setPanels] = useState(PANELS);
	const { modeTabIdxes } = useRecipeCommonParams();
	const { setSelectedAreaNo } = useSelectedAreaNo();
	const { sFov } = useTestRunState();

	const { setRecipeModeParam } = useRecipeModeParam();

	useEffect(() => {
		setRecipeModeParam();
	}, [setRecipeModeParam]);

	useEffect(() => {
		setLabels(LABELS.filter((_, idx) => modeTabIdxes.includes(idx)));
		setPanels(PANELS.filter((_, idx) => modeTabIdxes.includes(idx)));
		if (sFov == null) return;
		setSelectedAreaNo(sFov.areaNo);
	}, [sFov, modeTabIdxes, setSelectedAreaNo]);

	return (
		<Allotment vertical defaultSizes={[466, 540, 48]}>
			<Box sx={{ height: "100%", width: "100%", overflow: "auto" }}>
				<RecipeCommonParameter isTestRun />
			</Box>
			<Box sx={{ height: "100%", width: "100%", overflow: "auto" }}>
				<Box sx={{ height: "100%", width: "100%" }}>
					<Tabs labels={labels} panels={panels} />
				</Box>
			</Box>
			<Allotment.Pane minSize={48} maxSize={48}>
				<ReTestRun />
			</Allotment.Pane>
		</Allotment>
	);
};
