import CloseIcon from "@mui/icons-material/Close";
import {
	Dialog,
	DialogActions,
	DialogContent,
	DialogContentText,
	DialogTitle,
	IconButton,
	styled,
} from "@mui/material";
import { Box } from "@mui/system";
import { type ReactNode, useRef, useState } from "react";
import PrimaryButton from "~/components/elements/PrimaryButton";
import SecondaryButton from "~/components/elements/SecondaryButton";
import { Toast } from "~/components/elements/Toast";
import { MB_MMI_COPYRIGHT, MB_MMI_VERSION } from "~/config";

interface AboutDialogProp {
	isAboutDialogOpen: boolean;
	setIsAboutDialogOpen: (isAboutOpen: boolean) => void;
}

interface DialogTitleProps {
	children?: ReactNode;
	onClose: () => void;
}

const BootstrapDialog = styled(Dialog)(({ theme }) => ({
	"& .MuiDialogContent-root": {
		padding: theme.spacing(2),
	},
	"& .MuiDialogActions-root": {
		padding: theme.spacing(1),
	},
}));

// Xボタン付きダイアログタイトルバー
function BootstrapDialogTitle(props: DialogTitleProps): JSX.Element {
	const { children, onClose, ...other } = props;
	return (
		<DialogTitle sx={{ height: 48, m: 0, p: 2 }} {...other}>
			{children}
			<IconButton
				aria-label="close"
				onClick={onClose}
				sx={{
					position: "absolute",
					right: 8,
					top: 8,
					color: (theme) => theme.palette.grey[500],
				}}
			>
				<CloseIcon />
			</IconButton>
		</DialogTitle>
	);
}

// メッセージ表示部分
const MessageContent = (prop: {
	msg?: string[];
}): JSX.Element => {
	return (
		<Box>
			<DialogContentText sx={{ whiteSpace: "pre-wrap" }}>
				{prop.msg?.map((d) => d).join("\r\n")}
			</DialogContentText>
		</Box>
	);
};

export const AboutDialog = (prop: AboutDialogProp): JSX.Element => {
	const [copyMessage, setCopyMessage] = useState("");
	const [isError, setIsError] = useState(false);
	const ref = useRef<HTMLDivElement>(null);

	const handleClose = (): void => {
		prop.setIsAboutDialogOpen(false);
	};

	const handleClickCopy = (): void => {
		navigator.clipboard
			.writeText(`${aboutMessage.join("\r\n")}\r\n`)
			.then(() => {
				setIsError(false);
				setCopyMessage("Copied.");
			})
			.catch(() => {
				console.error("about copy failed.");
				setIsError(true);
				setCopyMessage("Copy failed.");
			});
	};

	const now = new Date();
	const aboutDisplayMessage = [
		`Version: ${MB_MMI_VERSION}`,
		"GUI:",
		`    Commit: ${import.meta.env.VITE_GUI_COMMIT_HASH}`,
		`    Date: ${import.meta.env.VITE_GUI_COMMIT_DATE} (${elapsedDate(new Date(import.meta.env.VITE_GUI_COMMIT_DATE), now)})`,
		"Controller:",
		`    Commit: ${import.meta.env.VITE_CONTROLLER_COMMIT_HASH}`,
		`    Date: ${import.meta.env.VITE_CONTROLLER_COMMIT_DATE} (${elapsedDate(new Date(import.meta.env.VITE_CONTROLLER_COMMIT_DATE), now)})`,
		"",
		MB_MMI_COPYRIGHT,
	];
	const aboutMessage = [
		`Version: ${MB_MMI_VERSION}`,
		"GUI:",
		`    Commit: ${import.meta.env.VITE_GUI_COMMIT_HASH}`,
		`    Date: ${import.meta.env.VITE_GUI_COMMIT_DATE}`,
		"Controller:",
		`    Commit: ${import.meta.env.VITE_CONTROLLER_COMMIT_HASH}`,
		`    Date: ${import.meta.env.VITE_CONTROLLER_COMMIT_DATE}`,
		"",
		MB_MMI_COPYRIGHT,
	];

	const toastTrigger = {
		isOpen: (copyMessage?.length ?? 0) !== 0,
		onClose: () => {
			if (copyMessage != null) setCopyMessage("");
		},
	};

	const refBound = ref.current?.getBoundingClientRect();
	const displayPosition = {
		bottom: `${window.innerHeight - (refBound?.top ?? 0) + 10}px`,
		right: `${window.innerWidth - (refBound?.right ?? 0) + 10}px`,
	};

	return (
		<BootstrapDialog
			disableEnforceFocus
			style={{ pointerEvents: "none" }}
			hideBackdrop
			PaperProps={{
				style: {
					pointerEvents: "auto",
				},
				sx: {
					position: "absolute",
					top: "25%",
				},
			}}
			maxWidth="sm" // ダイアログの最大幅(sm=600px)
			scroll="paper"
			onClose={handleClose}
			open={prop.isAboutDialogOpen}
		>
			<BootstrapDialogTitle onClose={handleClose}>
				{"MB-MMI"}
			</BootstrapDialogTitle>
			<DialogContent dividers>
				<MessageContent msg={aboutDisplayMessage} />
			</DialogContent>
			<DialogActions ref={ref}>
				<SecondaryButton autoFocus onClick={handleClickCopy}>
					COPY
				</SecondaryButton>
				<PrimaryButton autoFocus onClick={handleClose}>
					OK
				</PrimaryButton>
			</DialogActions>
			<Toast
				message={copyMessage}
				trigger={toastTrigger}
				anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
				severity={isError ? "error" : "success"}
				displayPosition={displayPosition}
			/>
		</BootstrapDialog>
	);
};

const elapsedDate = (date: Date, now: Date): string => {
	// 日付のみで比較（時刻部分を00:00:00にリセット）
	const days = Math.floor(
		(new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime() -
			new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime()) /
			(1000 * 60 * 60 * 24),
	);

	if (days < 0) return "future";
	if (days === 0) return "today";
	if (days === 1) return "yesterday";
	if (days < 7) return `${days} days ago`;
	if (days < 14) return "last week";
	if (days < 28) return `${Math.floor(days / 7)} weeks ago`;

	if (days < 365) {
		let months = now.getMonth() - date.getMonth();
		if (months < 0) months += 12;

		switch (months) {
			case 0:
				return "4 weeks ago";
			case 1:
				return "last month";
			default:
				return `${months} months ago`;
		}
	}

	const years = now.getFullYear() - date.getFullYear();

	switch (years) {
		case 0:
			return "11 months ago";
		case 1:
			return "last year";
		default:
			return `${years} years ago`;
	}
};
