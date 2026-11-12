import { Box, Divider } from "@mui/material";
import { Stack } from "@mui/system";
import { ModelRunButton } from "../components/ModelRunButton";
import { RemapCategoriesButton } from "../components/RemapCategoriesButton";
import { SaveAnnotationButton } from "../components/SaveAnnotationButton";

export const ADCToolBar = (): JSX.Element => {
	return (
		<Box>
			<Stack direction="row" spacing={2} sx={{ p: 2, alignItems: "center" }}>
				<RemapCategoriesButton />
				<Divider orientation="vertical" flexItem />
				<SaveAnnotationButton />
				<Divider orientation="vertical" flexItem />
				<ModelRunButton />
			</Stack>
		</Box>
	);
};
