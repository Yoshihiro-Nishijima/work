import ArrowBackIos from "@mui/icons-material/ArrowBackIos";
import ArrowForwardIos from "@mui/icons-material/ArrowForwardIos";
import Delete from "@mui/icons-material/Delete";
import { IconButton, Stack, ThemeProvider, createTheme } from "@mui/material";
import { mmiTheme } from "~/routes";
import { useReviewSFov } from "../hooks/useReviewModal";

const iconButtonTheme = createTheme({
	...mmiTheme,
	components: {
		MuiIconButton: {
			styleOverrides: {
				root: {
					height: "30px",
					width: "70px",
					color: "rgba(255, 255, 255, 1)",
					backgroundColor: "rgba(0, 0, 0, 0.5)",
					"&:hover": { backgroundColor: "rgba(0, 0, 0, 0.5)" },
					borderRadius: "4px",
					boxShadow:
						"0px 2px 4px -1px rgba(0, 0, 0, 0.2),0px 4px 5px 0px rgba(0, 0, 0, 0.14),0px 1px 10px 0px rgba(0, 0, 0, 0.12)",
					"&.Mui-disabled": {
						color: "rgba(255, 255, 255, 0.1)",
						backgroundColor: "rgba(0, 0, 0, 0.1)",
					},
				},
			},
		},
	},
});

export const ReviewControlButtons = () => {
	const {
		removeFromSelection,
		showPrevSFov,
		showNextSFov,
		isRemoveDisabled,
		isPrevDisabled,
		isNextDisabled,
	} = useReviewSFov();

	const onClickPrev = () => {
		showPrevSFov();
	};
	const onClickNext = () => {
		showNextSFov();
	};
	const onClickRemove = () => {
		removeFromSelection();
	};

	return (
		<ThemeProvider theme={iconButtonTheme}>
			<Stack
				sx={{
					position: "absolute",
					left: "2%",
					top: "10%",
					background: "rgba(0, 0, 0, 0)",
					color: "white",
					textAlign: "center",
					borderRadius: "5px",
					padding: "7px",
					zIndex: 20,
				}}
				direction="row"
				spacing={2}
			>
				<IconButton
					aria-label="prev"
					onClick={onClickPrev}
					disabled={isPrevDisabled}
				>
					<ArrowBackIos fontSize="medium" />
				</IconButton>
				<IconButton
					aria-label="next"
					onClick={onClickNext}
					disabled={isNextDisabled}
				>
					<ArrowForwardIos fontSize="medium" />
				</IconButton>
				<IconButton
					aria-label="remove"
					onClick={onClickRemove}
					disabled={isRemoveDisabled}
				>
					<Delete fontSize="medium" />
				</IconButton>
			</Stack>
		</ThemeProvider>
	);
};
