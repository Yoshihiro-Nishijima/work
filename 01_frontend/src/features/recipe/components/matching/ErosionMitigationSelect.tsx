import {
	useMatchingParam,
	useSetMatchingParam,
} from "~/features/recipe/hooks/useMatchingParam";

import { LabeledSelect } from "..";
import { type ErosionMitigation, ErosionMitigationList } from "../../types";

export interface ErosionMitigationSelectProps {
	disabled?: boolean;
}

export const ErosionMitigationSelect = ({
	disabled,
}: ErosionMitigationSelectProps): JSX.Element => {
	const { erosionMitigation, disabledImitation } = useMatchingParam();
	const { setErosionMitigation } = useSetMatchingParam();

	return (
		<LabeledSelect
			label="Erosion Mitigation"
			item={erosionMitigation ?? ""}
			setItem={(item: string) => {
				setErosionMitigation(item as ErosionMitigation);
			}}
			selectOptions={[...ErosionMitigationList]}
			disabled={disabled || disabledImitation()}
		/>
	);
};
