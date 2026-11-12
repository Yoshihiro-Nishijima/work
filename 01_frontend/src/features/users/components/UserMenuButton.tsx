import AccountCircleOutlined from "@mui/icons-material/AccountCircleOutlined";
import {
	IconButton,
	Menu,
	type SxProps,
	type Theme,
	Tooltip,
	useTheme,
} from "@mui/material";
import { useRef, useState } from "react";
import { useLoginedUser } from "~/features/users/hooks/useLoginedUser";
import { About } from "./About";
import { LoginUserLabel } from "./LoginUserLabel";

interface UserMenuButtonProp {
	top?: number;
	right?: number;
	sx?: SxProps<Theme>;
}

export const UserMenuButton = ({
	top = 8,
	right = 10,
	sx = {},
}: UserMenuButtonProp): JSX.Element => {
	const { loginedUser } = useLoginedUser();
	const [isMenuOpen, setIsMenuOpen] = useState(false);
	const ref = useRef<HTMLButtonElement>(null);
	const theme = useTheme();

	const handleClickUserMenu = (): void => {
		setIsMenuOpen(true);
	};
	const handleCloseUserMenu = (): void => {
		setIsMenuOpen(false);
	};

	const refBound = ref.current?.getBoundingClientRect();
	const menuTop = refBound?.bottom ?? 0;
	const menuLeft = refBound?.left ?? 0;

	return (
		<>
			<Tooltip title={loginedUser?.loginId ?? "unknown user"}>
				<IconButton
					onClick={handleClickUserMenu}
					sx={{
						textTransform: "none",
						position: "absolute",
						top,
						right,
						color: theme.palette.primary.contrastText,
						...sx,
					}}
					ref={ref}
				>
					<AccountCircleOutlined />
				</IconButton>
			</Tooltip>
			<Menu
				open={isMenuOpen}
				onClose={handleCloseUserMenu}
				anchorReference="anchorPosition"
				anchorPosition={{ top: menuTop, left: menuLeft }}
				slotProps={{
					root: {
						onContextMenu: (e) => {
							e.preventDefault();
						},
					},
				}}
			>
				<LoginUserLabel />
				<About setIsMenuOpen={setIsMenuOpen} />
			</Menu>
		</>
	);
};
