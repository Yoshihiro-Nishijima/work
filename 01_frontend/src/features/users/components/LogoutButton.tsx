import LogoutOutlined from "@mui/icons-material/LogoutOutlined";
import {
	IconButton,
	Stack,
	type SxProps,
	type Theme,
	Tooltip,
	Typography,
	useTheme,
} from "@mui/material";
import { useLogin } from "~/features/login/hooks/useLogin";

interface LogoutButtonProp {
	top?: number;
	right?: number;
	sx?: SxProps<Theme>;
}

export const LogoutButton = ({
	top = 8,
	right = 40,
	sx = {},
}: LogoutButtonProp): JSX.Element => {
	const { doLogout } = useLogin();
	const theme = useTheme();

	const handleClickLogout = (): void => {
		doLogout();
	};

	return (
		<Tooltip title="logout">
			<IconButton
				onClick={handleClickLogout}
				sx={{
					textTransform: "none",
					position: "absolute",
					top,
					right,
					color: theme.palette.primary.contrastText,
					...sx,
				}}
			>
				<Stack direction="row" sx={{ alignItems: "center" }} px={1}>
					<LogoutOutlined />
					<Typography sx={{ textTransform: "none" }}>Logout</Typography>
				</Stack>
			</IconButton>
		</Tooltip>
	);
};
