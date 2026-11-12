import { Select } from "~/components/elements";
import { Fieldset } from "~/components/layouts";

import { useMemo } from "react";
import { useResultJobType } from "~/features/misc/hooks/useResultsJobType";
import { useTrainingQueue } from "../hooks/useTrainingQueue";
import { useTrainingTypeParam } from "../hooks/useTrainingTypeParam";
import {
	type TrainingType,
	TrainingTypeList,
	TrainingTypeListText,
} from "../type";

export const TrainingTypeSelect = (): JSX.Element => {
	const { trainingType, setTrainingType } = useTrainingTypeParam();
	const { jobType } = useResultJobType();
	const { setIsTrainingJobQueued } = useTrainingQueue();

	const isD2DOnly =
		jobType != null && ["Camera", "Trainable D2D"].includes(jobType);
	const { selectOptions, selectOptionsText } = useMemo(() => {
		return isD2DOnly
			? {
					selectOptions: [TrainingTypeList[0]],
					selectOptionsText: [TrainingTypeListText[0]],
				}
			: {
					selectOptions: [...TrainingTypeList],
					selectOptionsText: [...TrainingTypeListText],
				};
	}, [isD2DOnly]);

	if (isD2DOnly && trainingType !== TrainingTypeList[0]) {
		setTrainingType(TrainingTypeList[0]);
	}

	return (
		<Fieldset legend="Training Type" sx={{ width: "30%" }}>
			<Select
				item={trainingType}
				setItem={(v: string) => {
					setTrainingType(v as TrainingType);
					setIsTrainingJobQueued(false);
				}}
				selectOptions={selectOptions}
				selectOptionsText={selectOptionsText}
				sx={{ width: "100%" }}
			/>
		</Fieldset>
	);
};
