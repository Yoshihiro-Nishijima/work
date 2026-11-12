import { Alert, type AlertColor, Snackbar } from "@mui/material";
import type { ReactNode } from "react";

interface ToastAlertProps {
	severity?: AlertColor;
	opened: boolean;
	setOpened: (value: React.SetStateAction<boolean>) => void;
	children: ReactNode;
}

export const ToastAlert = (props: ToastAlertProps): JSX.Element => {
	const { severity, opened, setOpened } = props;

	const handleClose = (
		_event: React.SyntheticEvent | Event,
		reason?: string,
	): void => {
		if (reason === "clickaway") {
			return;
		}

		setOpened(false);
	};

	return (
		<Snackbar open={opened} autoHideDuration={6000} onClose={handleClose}>
			<Alert onClose={handleClose} severity={severity} sx={{ width: "100%" }}>
				{props.children}
			</Alert>
		</Snackbar>
	);
};
