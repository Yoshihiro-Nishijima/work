import type { SxProps, Theme } from "@mui/material";

import { LogoutButton } from "~/features/users/components/LogoutButton";
import { UserMenuButton } from "~/features/users/components/UserMenuButton";

interface UserMenuBarProp {
	top?: number;
	right?: number;
	logoutOffsetRight?: number;
	sx?: SxProps<Theme>;
}

export const UserMenuBar = ({
	top = 8,
	right = 10,
	logoutOffsetRight = 30,
	sx = {},
}: UserMenuBarProp): JSX.Element => {
	return (
		<>
			<LogoutButton top={top} right={right + logoutOffsetRight} sx={sx} />
			<UserMenuButton top={top} right={right} sx={sx} />
		</>
	);
};
