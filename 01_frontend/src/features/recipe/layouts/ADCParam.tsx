import { Stack } from "@mui/material";

import { ADCModel, UploadClasses } from "~/features/recipe/components/adc";
import { useADCEnabledValue } from "~/features/recipe/hooks";

interface ADCParamProps {
	isModelReadonly?: boolean;
}

export const ADCParam = ({
	isModelReadonly = false,
}: ADCParamProps): JSX.Element => {
	const enabled = useADCEnabledValue();

	return (
		<Stack spacing={2} marginX={2} marginY={1}>
			<ADCModel checked={enabled} isReadonly={isModelReadonly} />
			<UploadClasses disabled={!enabled} hidden={isModelReadonly} />
		</Stack>
	);
};
