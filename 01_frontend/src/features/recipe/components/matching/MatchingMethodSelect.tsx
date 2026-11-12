import {
	useMatchingParam,
	useSetMatchingParam,
} from "~/features/recipe/hooks/useMatchingParam";

import { LabeledSelect } from "..";
import { type MatchingMethod, MatchingMethodList } from "../../types/Matching";

export interface MatchingMethodSelectProps {
	disabled?: boolean;
}

export const MatchingMethodSelect = ({
	disabled,
}: MatchingMethodSelectProps): JSX.Element => {
	const { matchingMethod } = useMatchingParam();
	const { setMatchingMethod } = useSetMatchingParam();

	return (
		<LabeledSelect
			label="Matching Method"
			item={matchingMethod}
			setItem={(item: string) => {
				setMatchingMethod(item as MatchingMethod);
			}}
			selectOptions={[...MatchingMethodList]}
			disabled={disabled}
		/>
	);
};
