import { Stack } from "@mui/system";
import { Fieldset } from "~/components/layouts";
import { useIdw } from "~/features/map/hooks";
import { LabeledNumberInput } from "~/features/recipe/components";
import { useSFov } from "../hooks/useSFov";

export const SFovXYSetting = (): JSX.Element => {
	const { sFovX, sFovY, setSFovX, setSFovY } = useSFov();
	const { idw } = useIdw();

	if (idw == null) return <></>;
	return (
		<Fieldset legend="Coordinate" sx={{ textAlign: "left", height: "100%" }}>
			<Stack direction="row" spacing={2}>
				<LabeledNumberInput
					label="X [nm]:"
					num={sFovX}
					setNum={setSFovX}
					min={0}
					max={idw.chipPitch.x}
					step={1}
					labelXs={5}
				/>
				<LabeledNumberInput
					label="Y [nm]:"
					num={sFovY}
					setNum={setSFovY}
					min={0}
					max={idw.chipPitch.y}
					step={1}
					labelXs={5}
				/>
			</Stack>
		</Fieldset>
	);
};
