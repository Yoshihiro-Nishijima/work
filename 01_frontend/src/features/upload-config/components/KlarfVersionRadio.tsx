import {
	FormControl,
	FormControlLabel,
	Radio,
	RadioGroup,
} from "@mui/material";

import { Fieldset } from "~/components/layouts";

import type { KlarfVersion } from "../types";

interface KlarfRadioProps {
	klarfVersion: KlarfVersion;
	setKlarfVersion: (_: React.SetStateAction<KlarfVersion>) => void;
}

export const KlarfVersionRadio = (props: KlarfRadioProps): JSX.Element => {
	const { klarfVersion, setKlarfVersion } = props;

	const handleRadioChange = (
		event: React.ChangeEvent<HTMLInputElement>,
	): void => {
		setKlarfVersion((event.target as HTMLInputElement).value as KlarfVersion);
	};

	return (
		<Fieldset legend="Klarf version">
			<FormControl>
				<RadioGroup value={klarfVersion} onChange={handleRadioChange} row>
					<FormControlLabel
						value="1.2"
						control={<Radio />}
						label="1.2"
						labelPlacement="bottom"
					/>
					<FormControlLabel
						value="1.8"
						control={<Radio />}
						label="1.8"
						labelPlacement="bottom"
					/>
				</RadioGroup>
			</FormControl>
		</Fieldset>
	);
};
