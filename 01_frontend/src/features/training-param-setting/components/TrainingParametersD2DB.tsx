import { Stack } from "@mui/system";

import {
	LabeledNumberInput,
	LabeledSelect,
} from "~/features/recipe/components";
import { useTrainingParameterD2DB } from "../hooks/useTrainingParametersD2DB";

type ShadingLevelType = 1 | 2 | 3 | 4 | 5;
type GaussFilterLevelType = 1 | 2 | 3 | 4 | 5;

const ShagingCorrectionList = ["On", "Off"];
const GaussFilterList = ["On", "Off"];
const DyadicList = ["On", "Off"];
const ShadingLevelTypeList = ["1", "2", "3", "4", "5"];
const GaussFilterLevelTypeList = ["1", "2", "3", "4", "5"];

export const TrainingParametersD2DB = (): JSX.Element => {
	const {
		iterationValue,
		isShadingCorrection,
		shadingLevelType,
		isGaussFilter,
		gaussFilterLevelType,
		isDyadic,
		setIterationValue,
		setIsShadingCorrection,
		setShadingLevelType,
		setIsGaussFilter,
		setGaussFilterLevelType,
		setIsDyadic,
	} = useTrainingParameterD2DB();

	return (
		<div style={{ textAlign: "left" }}>
			<Stack spacing={1} m={2} width="300px" sx={{ height: "100%" }}>
				<LabeledNumberInput
					label="Iteration:"
					num={iterationValue}
					setNum={setIterationValue}
					min={1}
					max={100000}
				/>
				<LabeledSelect
					item={isShadingCorrection ? "On" : "Off"}
					setItem={(v: string) => {
						setIsShadingCorrection(v === "On");
					}}
					label="Shading Correction:"
					selectOptions={[...ShagingCorrectionList]}
				/>
				<LabeledSelect
					item={shadingLevelType.toString()}
					setItem={(v: string) => {
						setShadingLevelType(v as unknown as ShadingLevelType);
					}}
					label="Shading Level:"
					selectOptions={[...ShadingLevelTypeList]}
				/>
				<LabeledSelect
					item={isGaussFilter ? "On" : "Off"}
					setItem={(v: string) => {
						setIsGaussFilter(v === "On");
					}}
					label="Gauss Filter:"
					selectOptions={[...GaussFilterList]}
				/>
				<LabeledSelect
					item={gaussFilterLevelType.toString()}
					setItem={(v: string) => {
						setGaussFilterLevelType(v as unknown as GaussFilterLevelType);
					}}
					label="Gauss Filter Level:"
					selectOptions={[...GaussFilterLevelTypeList]}
				/>
				<LabeledSelect
					item={isDyadic ? "On" : "Off"}
					setItem={(v: string) => {
						setIsDyadic(v === "On");
					}}
					label="Dyadic:"
					selectOptions={[...DyadicList]}
				/>
			</Stack>
		</div>
	);
};
