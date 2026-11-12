import AccountCircleOutlined from "@mui/icons-material/AccountCircleOutlined";
import { ListItemIcon, ListItemText, MenuItem } from "@mui/material";
import { useLoginedUser } from "~/features/users/hooks/useLoginedUser";

export const LoginUserLabel = (): JSX.Element => {
	const { loginedUser } = useLoginedUser();

	return (
		<MenuItem divider disableTouchRipple>
			<ListItemIcon>
				<AccountCircleOutlined />
			</ListItemIcon>
			<ListItemText>{loginedUser?.loginId ?? "unknown user"}</ListItemText>
		</MenuItem>
	);
};
