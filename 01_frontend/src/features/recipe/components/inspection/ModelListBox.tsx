import { ListBox } from "~/components/elements/ListBox";
import { useJobType } from "~/features/recipe/hooks";
import {
	useInspectionParam,
	useSetInspectionParam,
} from "~/features/recipe/hooks/useInspectionParam";
import { useModels } from "~/features/recipe/hooks/useModels";

interface ModelListBoxProps {
	isReadonly: boolean;
}

export const ModelListBox = ({
	isReadonly,
}: ModelListBoxProps): JSX.Element | null => {
	const jobType = useJobType();
	const { models, fetchModels } = useModels(jobType);
	const { model } = useInspectionParam();
	const { setModel } = useSetInspectionParam();

	if (jobType !== "Trainable D2DB" && jobType !== "Trainable D2D") return null;

	return (
		<ListBox
			label="Model"
			text={model}
			setText={setModel}
			selectOptions={models}
			isReadonly={isReadonly}
			onOpen={fetchModels}
		/>
	);
};
