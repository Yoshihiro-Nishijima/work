import { LabeledSelect } from "..";
import {
	useInspectionParam,
	useJobType,
	useSetInspectionParam,
} from "../../hooks";

const MATCHING_DOWNSCALE_FACTOR_RANGE = ["2", "3", "4", "5", "6"];

export const MatchingDownscaleFactorSelect = (): JSX.Element | null => {
	const { matchingDownscaleFactor } = useInspectionParam();
	const { setMatchingDownscaleFactor } = useSetInspectionParam();
	const jobType = useJobType();

	if (jobType !== "D2D") return null;

	return (
		<LabeledSelect
			label="Matching Downscale Factor"
			labelXs={5}
			item={matchingDownscaleFactor.toString()}
			setItem={(item: string) => {
				setMatchingDownscaleFactor(Number(item));
			}}
			selectOptions={MATCHING_DOWNSCALE_FACTOR_RANGE}
			selectSx={{ "& .MuiSelect-select": { textAlign: "right" } }}
			menuItemSx={{ justifyContent: "flex-end" }}
			fullWidth
		/>
	);
};
