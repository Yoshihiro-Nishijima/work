import { Typography } from "@mui/material";

import { useLoginSuccess } from "~/features/login/hooks/useLogin";

export const LoginErrorMesseage = (): JSX.Element => {
	const hasloginSuccess = useLoginSuccess();

	if (hasloginSuccess) {
		return <Typography />;
	}
	return (
		<Typography variant="h5" color="red">
			Invalid loginId or password.
		</Typography>
	);
};
