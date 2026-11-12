import SaveIcon from "@mui/icons-material/Save";
import { Box } from "@mui/system";
import PrimaryButton from "~/components/elements/PrimaryButton";

interface SaveButtonProps {
	loading?: boolean;
	onClick?: React.MouseEventHandler<HTMLButtonElement> | undefined;
}

export const SaveButton = (props: SaveButtonProps): JSX.Element => {
	return (
		<Box justifyContent="right" sx={{ display: "flex" }}>
			<PrimaryButton
				onClick={props.onClick}
				startIcon={<SaveIcon />}
				loading={props.loading}
				loadingPosition="start"
			>
				Save
			</PrimaryButton>
		</Box>
	);
};
