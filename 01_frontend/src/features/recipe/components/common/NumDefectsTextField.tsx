import { useNumDefects } from "~/features/recipe/hooks/useRecipeCommonParam";
import { LabeledNumberInput } from "..";
export const NumDefectsTextField = (): JSX.Element => {
	const [numDefects, setNumDefects] = useNumDefects();

	return (
		<div>
			<LabeledNumberInput
				label="Maximum Number of Defects"
				num={numDefects}
				setNum={setNumDefects}
				min={1}
				max={100}
				labelXs={10}
			/>
		</div>
	);
};
