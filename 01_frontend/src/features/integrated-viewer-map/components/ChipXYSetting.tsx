import { Stack } from "@mui/system";
import { Fieldset } from "~/components/layouts";
import { useIdw } from "~/features/map/hooks/useIdw";
import { LabeledNumberInput } from "~/features/recipe/components";
import { useSFov } from "../hooks/useSFov";

export const ChipXYSetting = (): JSX.Element => {
	const { chipX, chipY, setChipX, setChipY } = useSFov();
	const { idw } = useIdw();

	if (idw == null) return <></>;
	return (
		<Fieldset legend="Chip" sx={{ textAlign: "left", height: "100%" }}>
			<Stack direction="row" spacing={2}>
				<LabeledNumberInput
					label="X :"
					num={chipX}
					setNum={setChipX}
					min={-idw.mapOrigin.x}
					max={idw.mapOrigin.x}
					labelXs={5}
				/>
				<LabeledNumberInput
					label="Y :"
					num={chipY}
					setNum={setChipY}
					min={-idw.mapOrigin.y}
					max={idw.mapOrigin.y}
					labelXs={5}
				/>
			</Stack>
		</Fieldset>
	);
};
