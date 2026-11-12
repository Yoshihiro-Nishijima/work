import { ExitToApp, RemoveRedEye } from "@mui/icons-material";
import { Button, Stack, Typography } from "@mui/material";
import { useReviewModal } from "~/features/training-mode-sfov-view/hooks/useReviewModal";

export const ReviewButton = (): JSX.Element => {
	const { isReviewModalOpen, setReviewModalOpen, isReviewModalDisabled } =
		useReviewModal();

	// Exit Reviewボタンクリックイベント
	const handleClickExitReview = (): void => {
		setReviewModalOpen(false);
	};

	// Reviewボタンクリックイベント
	const handleClickReviewOpen = (): void => {
		setReviewModalOpen(true);
	};

	return (
		<Button
			variant="contained"
			disabled={isReviewModalDisabled}
			onClick={
				isReviewModalOpen ? handleClickExitReview : handleClickReviewOpen
			}
			sx={{
				width: 170,
				height: 24,
				display: "flex",
				flexDirection: "row",
				justifyContent: "start",
			}}
		>
			<Stack sx={{ alignItems: "Center" }} direction="row">
				{isReviewModalOpen ? (
					<ExitToApp sx={{ ml: 0, mx: 0, p: 0, textAligns: "left" }} />
				) : (
					<RemoveRedEye sx={{ ml: 0, mx: 0, p: 0, textAligns: "left" }} />
				)}
				<Typography sx={{ ml: 1, textTransform: "none", textAligns: "center" }}>
					{isReviewModalOpen ? "Exit Review" : "Review"}
				</Typography>
			</Stack>
		</Button>
	);
};
