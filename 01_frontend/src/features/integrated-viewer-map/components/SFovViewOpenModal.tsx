import { Box, Button, Dialog, Stack, Typography } from "@mui/material";
import { useRef, useState } from "react";
import PrimaryButton from "~/components/elements/PrimaryButton";
import { Toast } from "~/components/elements/Toast";
import { TitleBarWithCloseButton } from "~/features/integrated-viewer-sfov-view/components/TitleBarWithCloseButton";
import { useSFovViewModal } from "~/features/integrated-viewer-sfov-view/hooks/useSFovViewModal";
import { useListDrawerInfo } from "../hooks/useListDrawerInfo";
import { useSFov } from "../hooks/useSFov";
import { ChipXYSetting } from "./ChipXYSetting";
import { SFovXYSetting } from "./SFovXYSetting";

const TOAST_TOP_MARGIN = 20;
const BUTTON_LEFT_MARGIN = 5;

const SFOV_NOT_FOUND_MESSAGE =
	"Not Found at the specified coordinates. Please check the values and try again.";

export const SFovViewOpenModal = (): JSX.Element => {
	const { updateSFovViewModalOpen } = useSFovViewModal();
	const { setMfovnoAndSfovno, notFoundSFov } = useSFov();
	const { isListDrawerOpen, listDrawerWidth } = useListDrawerInfo();
	const [open, setOpen] = useState(false);
	const [errorMessage, setErrorMessage] = useState<string | undefined>(
		undefined,
	);

	// トースト調整座標の計算用にボタン位置取得用ref
	const ref = useRef<HTMLButtonElement>(null);
	const refBound = ref.current?.getBoundingClientRect();

	// sFov Viewボタンの下あたりにトースト表示
	const displayPosition = {
		top: `${(refBound?.bottom ?? 0) + TOAST_TOP_MARGIN}px`,
		left: `${refBound?.left ?? 0}px`,
	};
	const toastTrigger = {
		isOpen: errorMessage != null,
		onClose: () => {
			setErrorMessage(undefined);
		},
	};

	const handleClickOpen = (): void => {
		setOpen(true);
	};
	const handleClose = (): void => {
		setOpen(false);
	};

	const handleClickSFovViewModalOpen = async (): Promise<void> => {
		setMfovnoAndSfovno()
			.then((result: boolean) => {
				if (!result) return;
				setOpen(false);
				updateSFovViewModalOpen(true);
			})
			.catch((err: string) => {
				setErrorMessage(err);
			});
	};

	return (
		<>
			<Box
				sx={{
					position: "absolute",
						top: "8px",
					left: isListDrawerOpen
						? `${listDrawerWidth + BUTTON_LEFT_MARGIN}px`
						: "3%",
					background: "rgba(255, 255, 255, 1)",
					borderRadius: "5px",
					padding: "0px",
				}}
			>
				<Button
					variant="outlined"
					onClick={handleClickOpen}
					sx={{ m: 0, fontSize: "0.75rem", textTransform: "none" }}
				>
					Go To Position
				</Button>
			</Box>

			<Dialog
				open={open}
				onClose={handleClose}
				maxWidth="md"
				aria-labelledby="sfov-view-title"
				aria-describedby="sfov-view-description"
			>
				<Box>
					<TitleBarWithCloseButton
						title="Go To Position"
						onClickEvent={handleClose}
						sx={{ textAlign: "Center" }}
					/>
					<Box p={1}>
						<Stack spacing={1}>
							<ChipXYSetting />
							<SFovXYSetting />
						</Stack>
						<Stack direction="row" spacing={1} marginTop={2}>
							<Typography
								color={"error.main"}
								visibility={notFoundSFov ? "visible" : "hidden"}
								sx={{
									width: "220px",
									height: "60px",
									px: "10px",
									whiteSpace: "pre-wrap",
								}}
							>
								{SFOV_NOT_FOUND_MESSAGE}
							</Typography>
							<Box style={{ textAlign: "center" }}>
								<PrimaryButton
									ref={ref}
									onClick={handleClickSFovViewModalOpen}
									sx={{ m: 1, fontSize: "0.75rem", textTransform: "none" }}
								>
									Go
								</PrimaryButton>
								<Toast
									message={errorMessage ?? ""}
									trigger={toastTrigger}
									anchorOrigin={{ vertical: "top", horizontal: "left" }}
									severity={errorMessage != null ? "error" : "success"}
									displayPosition={displayPosition}
								/>
							</Box>
						</Stack>
					</Box>
				</Box>
			</Dialog>
		</>
	);
};
