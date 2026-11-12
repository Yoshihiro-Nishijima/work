import { Select } from "~/components/elements";
import { useCustomParam } from "~/features/recipe/hooks/useCustomParam";

import { type IsReadonlyProp, type ToneType, ToneTypeList } from "../../types";

export const ToneSelect = ({
	isReadonly = false,
}: IsReadonlyProp): JSX.Element => {
	const { tone, setTone } = useCustomParam();
	return (
		<Select
			item={tone ?? ""}
			setItem={(v: string) => {
				setTone(v as ToneType);
			}}
			label="Tone"
			selectOptions={[...ToneTypeList]}
			disabled={isReadonly}
		/>
	);
};
