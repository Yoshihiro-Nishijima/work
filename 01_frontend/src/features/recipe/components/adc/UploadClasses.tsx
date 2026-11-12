import { Box, Checkbox, FormControlLabel } from "@mui/material";
import { useMemo } from "react";

import { Fieldset } from "~/components/layouts";
import { useADCUploadClasses } from "~/features/recipe/hooks";

export interface UploadClassesProps {
	disabled?: boolean;
	hidden?: boolean;
}

export const UploadClasses = ({
	disabled,
	hidden,
}: UploadClassesProps): JSX.Element | undefined => {
	const [classes, setClasses] = useADCUploadClasses();

	const [numClasses, ClassCheckbox] = useMemo(() => {
		const classSet = new Set(classes.filter((no) => 0 < no && no <= 10));

		return [
			classSet.size,
			({
				value,
				setClasses,
				disabled,
			}: {
				value: number;
				setClasses: (classes: number[]) => void;
				disabled?: boolean;
			}) => {
				const checked = classSet.has(value);

				return (
					<FormControlLabel
						control={
							<Checkbox
								checked={checked}
								onChange={() => {
									if (checked) {
										classSet.delete(value);
									} else {
										classSet.add(value);
									}

									setClasses(Array.from(classSet).sort());
								}}
							/>
						}
						disabled={disabled}
						label={`CAT${value}`}
					/>
				);
			},
		];
	}, [classes]);

	if (hidden) return;

	const allChecked = numClasses === 10;

	return (
		<Fieldset legend="Upload Classes" sx={{ maxWidth: "27qem" }}>
			<Box style={{ width: "max-content" }}>
				<FormControlLabel
					control={
						<Checkbox
							checked={allChecked}
							indeterminate={!(allChecked || numClasses === 0)}
							onChange={() =>
								setClasses(allChecked ? [] : [1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
							}
						/>
					}
					disabled={disabled}
					label="All"
				/>
			</Box>
			<ClassCheckbox value={1} setClasses={setClasses} disabled={disabled} />
			<ClassCheckbox value={2} setClasses={setClasses} disabled={disabled} />
			<ClassCheckbox value={3} setClasses={setClasses} disabled={disabled} />
			<ClassCheckbox value={4} setClasses={setClasses} disabled={disabled} />
			<ClassCheckbox value={5} setClasses={setClasses} disabled={disabled} />
			<ClassCheckbox value={6} setClasses={setClasses} disabled={disabled} />
			<ClassCheckbox value={7} setClasses={setClasses} disabled={disabled} />
			<ClassCheckbox value={8} setClasses={setClasses} disabled={disabled} />
			<ClassCheckbox value={9} setClasses={setClasses} disabled={disabled} />
			<ClassCheckbox value={10} setClasses={setClasses} disabled={disabled} />
		</Fieldset>
	);
};
