import {
	useMatchingParam,
	useSetMatchingParam,
} from "~/features/recipe/hooks/useMatchingParam";

import { LabeledSelect } from "..";
import { type AlignmentMode, AlignmentModeList } from "../../types";

export interface AlignmentModeSelectProps {
	disabled?: boolean;
}

export const AlignmentModeSelect = ({
	disabled,
}: AlignmentModeSelectProps): JSX.Element => {
	const { alignmentMode, disabledImitation } = useMatchingParam();
	const { setAlignmentMode } = useSetMatchingParam();

	return (
		<LabeledSelect
			label="Alignment Mode"
			item={alignmentMode ?? ""}
			setItem={(item: string) => {
				setAlignmentMode(item as AlignmentMode);
			}}
			selectOptions={[...AlignmentModeList]}
			disabled={disabled || disabledImitation()}
		/>
	);
};
