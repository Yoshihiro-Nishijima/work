import { Box } from "@mui/material";
import { useTrainingParameterD2D } from "../../hooks/useTrainingParametersD2D";
import { TrainingCountTypeParams } from "./TrainingCountTypeParams";

export const TrainingCountParams = (): JSX.Element => {
	const {
		trainingCountType,
		trainingCount,
		setTrainingCountType,
		setTrainingCount,
	} = useTrainingParameterD2D();

	return (
		// 他のParamsコンポーネントと右端を揃えるためにpadding指定
		<Box p={1} width="300px">
			<TrainingCountTypeParams
				countType={trainingCountType}
				count={trainingCount}
				setCountType={setTrainingCountType}
				setCount={setTrainingCount}
				min={1}
				max={100000}
			/>
		</Box>
	);
};
