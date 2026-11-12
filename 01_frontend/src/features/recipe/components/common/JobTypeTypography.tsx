import { Typography } from "@mui/material";
import { Box } from "@mui/system";

import { useJobType } from "~/features/recipe/hooks/useRecipeCommonParam";

export const JobTypeTypography = (): JSX.Element => {
	const jobType = useJobType();
	return (
		<Box sx={{ display: "flex", flexDirection: "row" }}>
			<Typography sx={{ width: "70px" }}>JobType :</Typography>
			<Typography sx={{ textDecoration: "underline" }}>{jobType}</Typography>
		</Box>
	);
};
