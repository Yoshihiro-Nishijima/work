import {
	useMatchingParam,
	useSetMatchingParam,
} from "~/features/recipe/hooks/useMatchingParam";

import { LabeledNumberInput } from "..";

export interface SearchAreaProps {
	disabled?: boolean;
}

export const SearchArea = ({ disabled }: SearchAreaProps): JSX.Element => {
	const { searchArea, searchAreaRange } = useMatchingParam();
	const { setSearchArea } = useSetMatchingParam();

	return (
		<LabeledNumberInput
			label="Search Area"
			num={searchArea}
			setNum={setSearchArea}
			min={searchAreaRange[0]}
			max={searchAreaRange[1]}
			disabled={disabled}
		/>
	);
};
