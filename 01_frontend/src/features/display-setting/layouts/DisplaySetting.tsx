import { Fieldset } from "~/components/layouts";

import { DefectDisplayDataGrid } from "../components/DefectDisplayDataGrid";

export const DisplaySetting = (): JSX.Element => {
	return (
		<Fieldset legend="Display Setting" sx={{ width: "400px" }}>
			<DefectDisplayDataGrid />
		</Fieldset>
	);
};
