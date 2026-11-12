import { FormControlLabel, Radio, RadioGroup } from "@mui/material";
import { LabeledFormGrid } from "~/components/elements/LabeledFormGrid";
import {
	useInspectionParam,
	useJobType,
	useSetInspectionParam,
} from "../../hooks";

export const AlgorithmVersionRadio = (): JSX.Element | null => {
	const { algolithmVersion } = useInspectionParam();
	const { setAlgolithmVersion } = useSetInspectionParam();
	const jobType = useJobType();

	if (jobType !== "D2D") return null;

	const handleRadioChange = (
		event: React.ChangeEvent<HTMLInputElement>,
	): void => {
		setAlgolithmVersion(Number((event.target as HTMLInputElement).value));
	};

	return (
		<LabeledFormGrid label="Algorithm Version" labelXs={5}>
			<RadioGroup
				value={algolithmVersion.toString()}
				onChange={handleRadioChange}
				sx={{ width: "60%", justifyContent: "space-between", mx: "auto" }}
				row
			>
				<FormControlLabel
					value="0"
					control={<Radio />}
					label="0"
					labelPlacement="bottom"
				/>
				<FormControlLabel
					value="1"
					control={<Radio />}
					label="1"
					labelPlacement="bottom"
				/>
			</RadioGroup>
		</LabeledFormGrid>
	);
};
