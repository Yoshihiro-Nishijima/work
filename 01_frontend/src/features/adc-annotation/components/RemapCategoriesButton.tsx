import { Button } from "@mui/material";
import { useState } from "react";
import { RemapCategoriesDialog } from "./RemapCategoriesDialog";

export const RemapCategoriesButton = (): JSX.Element => {
	const [dialogOpen, setDialogOpen] = useState(false);
	const onClickHandler = (): void => setDialogOpen(true);
	const onDialogCloseHandler = (): void => setDialogOpen(false);
	return (
		<>
			<Button variant="outlined" onClick={onClickHandler}>
				REMAP CATEGORIES
			</Button>
			<RemapCategoriesDialog open={dialogOpen} onClose={onDialogCloseHandler} />
		</>
	);
};
