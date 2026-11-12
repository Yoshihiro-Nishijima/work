import { Box } from "@mui/system";

import { Login } from "~/features/login/layouts/Login";

// React.lazy を利用するため default export を使用する
const LoginView = (): JSX.Element => {
	return (
		<Box sx={{ height: "70vh", width: "100%" }}>
			<Login />
		</Box>
	);
};
export default LoginView;
