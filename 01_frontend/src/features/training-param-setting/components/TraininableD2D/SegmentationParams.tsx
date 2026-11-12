import { Stack } from "@mui/material";

import { LabeledNumberInput } from "~/features/recipe/components";

import { useTrainingParameterD2D } from "../../hooks/useTrainingParametersD2D";
import { CheckboxFieldSet } from "../CheckboxFieldSet";
import { TrainingCountTypeParams } from "./TrainingCountTypeParams";

export const SegmentationParams = (): JSX.Element => {
	const {
		segmentsTrainingCountType,
		segmentsTrainingCount,
		numberOfSegmentsValue,
		dummyRatioValue,
		isSegmentation,
		setSegmentsTrainingCountType,
		setSegmentsTrainingCount,
		setNumberOfSegmentsValue,
		setDummyRatioValue,
		setIsSegmentation,
	} = useTrainingParameterD2D();

	return (
		<CheckboxFieldSet
			label="Segmentation"
			checked={isSegmentation}
			setChecked={setIsSegmentation}
		>
			<Stack>
				<TrainingCountTypeParams
					countType={segmentsTrainingCountType}
					count={segmentsTrainingCount}
					setCountType={setSegmentsTrainingCountType}
					setCount={setSegmentsTrainingCount}
					disabled={!isSegmentation}
					min={1}
					max={100000}
				/>
				<LabeledNumberInput
					label="Number Of Segments:"
					num={numberOfSegmentsValue}
					setNum={setNumberOfSegmentsValue}
					labelXs={8}
					disabled={!isSegmentation}
					min={1}
					max={10}
				/>
				<LabeledNumberInput
					label="Dummy Ratio:"
					num={dummyRatioValue}
					setNum={setDummyRatioValue}
					labelXs={8}
					disabled={!isSegmentation}
					min={1}
					max={2}
				/>
			</Stack>
		</CheckboxFieldSet>
	);
};
