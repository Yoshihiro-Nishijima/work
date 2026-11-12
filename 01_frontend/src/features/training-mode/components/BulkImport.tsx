import { Fieldset } from "~/components/layouts";

import { ImportCareAreaButton } from "./ImportCareAreaButton";

export const BulkImport = (): JSX.Element => {
	return (
		<Fieldset legend=" Bulk Import ">
			<div style={{ width: "300", textAlign: "center" }}>
				<ImportCareAreaButton />
			</div>
		</Fieldset>
	);
};
