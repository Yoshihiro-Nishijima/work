import type { Meta, StoryObj } from "@storybook/react";
import { type ComponentProps, useEffect, useState } from "react";

import {
	useLogin,
	useLoginSuccess,
} from "~/features/login/hooks/mocks/useLogin.mock";

import { Login } from "../layouts/Login";

type Props = ComponentProps<typeof Login> & {
	isLoginSuccess: boolean;
};
const LoginMock = (props: Props): JSX.Element => {
	const [isLoginSuccess, setIsLoginSuccess] = useState(props.isLoginSuccess);
	const [isLoginSuccessProp, setIsLoginSuccessProp] = useState(
		props.isLoginSuccess,
	);
	const [loginResult, setLoginResult] = useState("");

	useLogin.mockReturnValue({
		doLogin: (): (() => void) => {
			if (isLoginSuccessProp) {
				setIsLoginSuccess(true);
				setLoginResult("成功");
			} else {
				setIsLoginSuccess(false);
				setLoginResult("失敗");
			}
			return () => {};
		},
		doLogout: (): (() => void) => {
			return () => {};
		},
	});

	useLoginSuccess.mockReturnValue(isLoginSuccess);

	useEffect(() => {
		setIsLoginSuccessProp(props.isLoginSuccess);
	}, [props.isLoginSuccess]);

	return (
		<div>
			ログイン認証結果: {loginResult}
			<Login />
		</div>
	);
};

const meta = {
	component: LoginMock,
} satisfies Meta<typeof Login>;

export default meta;
type Story = StoryObj<typeof LoginMock>;

export const Default: Story = {
	args: {
		isLoginSuccess: true,
	},
	argTypes: {
		isLoginSuccess: {
			description:
				"LOGINボタン押下後の動作を設定 <br> True:ログイン成功、False: ログイン失敗",
		},
	},
};
