import { Box, type SxProps, type Theme } from "@mui/system";
import type { Meta, StoryObj } from "@storybook/react";
import { useLoginedUser } from "~/features/users/hooks/mock/useLoginedUser.mock";
import type { LoginedUser } from "~/features/users/types";
import { UserMenuBar } from "../UserMenuBar";

type Props = {
	loginId: string;
	top: number;
	right: number;
	logoutOffsetRight: number;
	sx: SxProps<Theme>;
};

const castLoginedUser = (loginId: string): LoginedUser => {
	return { loginId: loginId, roles: [] } satisfies LoginedUser;
};

const MockUserMenuBar = (props: Props): JSX.Element => {
	useLoginedUser.mockReturnValue({
		loginedUser: castLoginedUser(props.loginId),
		setLoginedUser: (): void => {},
	});

	return (
		<Box sx={{ backgroundColor: "primary.main", height: "30px" }}>
			<UserMenuBar
				top={props.top}
				right={props.right}
				logoutOffsetRight={props.logoutOffsetRight}
				sx={props.sx}
			/>
		</Box>
	);
};

const meta = {
	component: MockUserMenuBar,
} satisfies Meta<typeof MockUserMenuBar>;
export default meta;
type Story = StoryObj<typeof MockUserMenuBar>;

export const Default: Story = {
	args: {
		loginId: "loginId",
		top: 10,
		right: 10,
		logoutOffsetRight: 30,
		sx: {},
	},
	argTypes: {
		loginId: {
			description: "ログインID",
		},
		top: {
			description: "縦方向表示位置(画面上端からの距離)",
		},
		right: {
			description: "ユーザメニューボタン 横方向表示位置(画面右端からの距離)",
		},
		logoutOffsetRight: {
			description:
				"ログアウトボタン 横方向表示位置(ユーザメニューボタン右端からの距離)",
		},
		sx: {
			description: 'スタイル 設定例 {color: "white"}',
		},
	},
};
