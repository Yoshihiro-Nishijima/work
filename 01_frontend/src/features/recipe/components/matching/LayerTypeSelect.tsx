import {
	useMatchingParam,
	useSetMatchingParam,
} from "~/features/recipe/hooks/useMatchingParam";

import { LabeledSelect } from "..";
import { useImportedParam } from "../../hooks";
import type { MatchingLayerType } from "../../types";

export interface LayerTypeSelectProps {
	disabled?: boolean;
}

export const LayerTypeSelect = ({
	disabled,
}: LayerTypeSelectProps): JSX.Element => {
	const { designLayerTypes } = useImportedParam();
	const { layerType } = useMatchingParam();
	const { setLayerType } = useSetMatchingParam();
	const selectOptions = ["All", ...designLayerTypes];

	return (
		<LabeledSelect
			label="Layer Type"
			item={selectOptions.includes(layerType) ? layerType : "All"}
			setItem={(item: string) => {
				setLayerType(item as MatchingLayerType);
			}}
			selectOptions={selectOptions}
			disabled={disabled}
		/>
	);
};
