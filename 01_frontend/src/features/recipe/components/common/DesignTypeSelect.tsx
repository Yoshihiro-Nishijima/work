import { Select } from "~/components/elements";
import { useRecipeCommonParams } from "~/features/recipe/hooks/useRecipeCommonParam";

import { type DesignType, DesignTypeList } from "../../types/CommonParam";

export interface DesignTypeSelectProps {
	disabled?: boolean;
}

export const DesignTypeSelect = ({
	disabled,
}: DesignTypeSelectProps): JSX.Element => {
	const { designType, setDesignType } = useRecipeCommonParams();
	return (
		<Select
			item={designType ?? ""}
			setItem={(v: string) => {
				setDesignType(v as DesignType);
			}}
			label="DesignType"
			selectOptions={[...DesignTypeList]}
			disabled={disabled}
		/>
	);
};
