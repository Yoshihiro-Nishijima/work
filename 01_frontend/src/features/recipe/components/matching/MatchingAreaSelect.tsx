import {
	useMatchingParam,
	useSetMatchingParam,
} from "~/features/recipe/hooks/useMatchingParam";

import { LabeledSelect } from "..";
import {
	type MatchingArea,
	MatchingAreaList,
	MatchingAreaText,
} from "../../types";

export interface MatchingAreaSelectProps {
	disabled?: boolean;
}

export const MatchingAreaSelect = ({
	disabled,
}: MatchingAreaSelectProps): JSX.Element => {
	const { matchingArea } = useMatchingParam();
	const { setMatchingArea } = useSetMatchingParam();

	return (
		<LabeledSelect
			label="Matching Area"
			item={matchingArea}
			setItem={(item: string) => {
				setMatchingArea(item as MatchingArea);
			}}
			selectOptions={[...MatchingAreaList]}
			selectOptionsText={MatchingAreaText}
			disabled={disabled}
		/>
	);
};
