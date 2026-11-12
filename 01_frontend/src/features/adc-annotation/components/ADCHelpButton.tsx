import HelpIcon from "@mui/icons-material/Help";
import { Tooltip, useTheme } from "@mui/material";
import { List, ListItem, ListItemText } from "@mui/material";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";

interface ADCHelpButtonProp {
	top?: number;
	right?: number;
}

export const ADCHelpButton = ({
	top = 4,
	right = 130,
}: ADCHelpButtonProp): JSX.Element => {
	const theme = useTheme();
	const helpMessage = (
		<Box sx={{ p: 0.5 }}>
			<Typography variant="subtitle2" sx={{ mb: 0.5, fontWeight: 600 }}>
				Guide
			</Typography>
			<List sx={{ pl: 2, py: 0 }}>
				<ListItem sx={{ py: 0 }} disableGutters>
					<ListItemText
						primary={
							<>
								NumKey{" "}
								<Typography component="span" fontWeight="bold" display="inline">
									1–9
								</Typography>{" "}
								/{" "}
								<Typography component="span" fontWeight="bold" display="inline">
									0
								</Typography>
								=10 : Set a value 1-10 to the selected item.
							</>
						}
					/>
				</ListItem>
				<ListItem sx={{ py: 0 }} disableGutters>
					<ListItemText
						primary={
							<>
								<Typography component="span" fontWeight="bold" display="inline">
									Delete / Backspace
								</Typography>{" "}
								: Delete the value from the selected item and set 0
								(=undefined).
							</>
						}
					/>
				</ListItem>
				<ListItem sx={{ py: 0 }} disableGutters>
					<ListItemText
						primary={
							<>
								<Typography component="span" fontWeight="bold" display="inline">
									Esc
								</Typography>{" "}
								: Discard the change of the selected item.
							</>
						}
					/>
				</ListItem>
			</List>
		</Box>
	);

	return (
		<Tooltip title={helpMessage}>
			<IconButton
				sx={{
					textTransform: "none",
					position: "absolute",
					top,
					right,
					color: theme.palette.primary.contrastText,
				}}
			>
				<HelpIcon />
			</IconButton>
		</Tooltip>
	);
};
