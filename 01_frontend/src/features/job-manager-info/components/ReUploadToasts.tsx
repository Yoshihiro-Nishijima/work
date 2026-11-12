import { ToastAlert } from "~/features/upload-config/components/ToastAlert";

export interface ReUploadToastsProps {
	successOpened: boolean;
	setSuccessOpened: React.Dispatch<React.SetStateAction<boolean>>;
	startedOpened: boolean;
	setStartedOpened: React.Dispatch<React.SetStateAction<boolean>>;
	failureOpened: boolean;
	setFailureOpened: React.Dispatch<React.SetStateAction<boolean>>;
	failureText: string;
}

export const ReUploadToasts = (props: ReUploadToastsProps): JSX.Element => {
	const {
		successOpened,
		setSuccessOpened,
		startedOpened,
		setStartedOpened,
		failureOpened,
		setFailureOpened,
		failureText,
	} = props;
	return (
		<>
			<ToastAlert
				opened={successOpened}
				setOpened={setSuccessOpened}
				severity="success"
			>
				Re-upload success
			</ToastAlert>
			<ToastAlert
				opened={startedOpened}
				setOpened={setStartedOpened}
				severity="info"
			>
				Re-upload started...
			</ToastAlert>
			<ToastAlert
				opened={failureOpened}
				setOpened={setFailureOpened}
				severity="error"
			>
				<p>Re-upload failed</p>
				<p>(reason: {failureText !== "" ? failureText : "unknown"})</p>
			</ToastAlert>
		</>
	);
};
