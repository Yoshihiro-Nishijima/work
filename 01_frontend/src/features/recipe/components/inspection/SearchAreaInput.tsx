import { LabeledNumberInput } from "..";
import {
	useInspectionParam,
	useJobType,
	useSetInspectionParam,
} from "../../hooks";

export const SearchAreaInput = (): JSX.Element | null => {
	const { searchArea } = useInspectionParam();
	const { setSearchArea } = useSetInspectionParam();
	const jobType = useJobType();

	if (jobType !== "D2D") return null;

	return (
		<LabeledNumberInput
			label="Search Area [nm]"
			num={searchArea}
			setNum={setSearchArea}
			max={5000}
			min={0}
		/>
	);
};
