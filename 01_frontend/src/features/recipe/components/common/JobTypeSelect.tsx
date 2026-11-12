import { Select } from "~/components/elements";
import { useRecipeCommonParams } from "~/features/recipe/hooks/useRecipeCommonParam";

import { type JobType, JobTypeList } from "../../types/CommonParam";

export const JobTypeSelect = (): JSX.Element => {
	const { jobType, setJobType } = useRecipeCommonParams();

	return (
		<Select
			item={jobType}
			setItem={(v: string) => {
				setJobType(v as JobType);
			}}
			label="JobType"
			selectOptions={[...JobTypeList]}
		/>
	);
};
