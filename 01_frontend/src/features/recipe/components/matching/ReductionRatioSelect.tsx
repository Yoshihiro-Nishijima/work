import {
	useMatchingParam,
	useSetMatchingParam,
} from "~/features/recipe/hooks/useMatchingParam";

import { LabeledSelect } from "..";
import { type ReductionRatio, ReductionRatioList } from "../../types";

export interface ReductionRatioSelectProps {
	disabled?: boolean;
}

export const ReductionRatioSelect = ({
	disabled,
}: ReductionRatioSelectProps): JSX.Element => {
	const { reductionRatio, disabledImitation } = useMatchingParam();
	const { setReductionRatio } = useSetMatchingParam();

	return (
		<LabeledSelect
			label="Reduction Ratio"
			item={reductionRatio ?? ""}
			setItem={(item: string) => {
				setReductionRatio(item as ReductionRatio);
			}}
			selectOptions={[...ReductionRatioList]}
			disabled={disabled || disabledImitation()}
		/>
	);
};
