import { Select } from "~/components/elements";
import { useCustomParam } from "~/features/recipe/hooks/useCustomParam";

import {
	type CategoryType,
	CategoryTypeList,
	type IsReadonlyProp,
} from "../../types";

export const CategorySelect = ({
	isReadonly = false,
}: IsReadonlyProp): JSX.Element => {
	const { category, setCategory } = useCustomParam();
	return (
		<Select
			item={category ?? ""}
			setItem={(v: string) => {
				setCategory(v as CategoryType);
			}}
			label="Category"
			selectOptions={[...CategoryTypeList]}
			disabled={isReadonly}
		/>
	);
};
