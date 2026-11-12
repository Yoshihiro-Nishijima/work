import { CheckboxFieldSet } from "~/features/training-param-setting/components/CheckboxFieldSet";
import { useInspectionParam, useSetInspectionParam } from "../../hooks";
import { ZoomRatioInput } from "./ZoomRatioInput";

export const Zoom = (): JSX.Element => {
	const { zoom } = useInspectionParam();
	const { setZoom } = useSetInspectionParam();

	return (
		<CheckboxFieldSet label="Zoom" checked={zoom} setChecked={setZoom}>
			<ZoomRatioInput />
		</CheckboxFieldSet>
	);
};
