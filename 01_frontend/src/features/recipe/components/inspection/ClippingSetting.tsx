import { Fieldset } from "~/components/layouts";
import {
	useInspectionParam,
	useSetInspectionParam,
} from "~/features/recipe/hooks/useInspectionParam";

import { LabeledNumberInput } from "..";

export const ClippingSetting = (): JSX.Element => {
	const { clippingFov } = useInspectionParam();
	const { setClippingFov } = useSetInspectionParam();
	return (
		<Fieldset legend="Clipping Setting">
			<LabeledNumberInput
				label="FOV [um]"
				num={clippingFov}
				setNum={setClippingFov}
				min={0.135}
				max={3}
				step={0.001}
				decimalPlaces={3}
				labelXs={6}
			/>
		</Fieldset>
	);
};
