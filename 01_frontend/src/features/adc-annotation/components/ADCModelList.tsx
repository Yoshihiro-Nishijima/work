import { useEffect } from "react";
import { Select } from "~/components/elements";
import { useADCModels } from "~/features/recipe/hooks";

interface ADCModelListProps {
	model: string;
	setModel: (model: string) => void;
}

export const ADCModelList = ({
	model,
	setModel,
}: ADCModelListProps): JSX.Element => {
	const { adcModels, fetchAdcModels } = useADCModels();
	useEffect(() => {
		if (adcModels.length > 0 && !model) {
			setModel(adcModels[0]);
		}
	}, [adcModels, model, setModel]);

	// modelNameListに存在しない場合は空文字を表示
	const validModel = adcModels.includes(model) ? model : "";

	return (
		<Select
			label={"Model"}
			item={validModel}
			setItem={setModel}
			selectOptions={adcModels}
			onOpen={fetchAdcModels}
		/>
	);
};
