import { Box, Stack } from "@mui/material";
import { Allotment } from "allotment";
import { TitleBar } from "~/components/elements/TitleBar";
import {
	ReExecute,
	RecipeCommonParameter,
	RecipeModeParameter,
} from "~/features/recipe";

const HEADER_HEIGHT = "36px";

export const Recipe = (): JSX.Element => {
	return (
		<Stack
			direction="column"
			sx={{ height: "100%", width: "100%" }}
			id="recipe-area"
		>
			<TitleBar title={"Recipe"} sx={{ height: HEADER_HEIGHT }} enableShadow />
			<Allotment vertical defaultSizes={[450, 540, 48]}>
				<Box sx={{ height: "100%", width: "100%", overflow: "auto" }}>
					<RecipeCommonParameter />
				</Box>
				<Box sx={{ height: "100%", width: "100%", overflow: "auto" }}>
					<RecipeModeParameter />
				</Box>
				<Allotment.Pane minSize={48} maxSize={48}>
					<ReExecute />
				</Allotment.Pane>
			</Allotment>
		</Stack>
	);
};
