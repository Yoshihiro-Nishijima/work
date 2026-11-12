import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import { Avatar, Box, Container, TextField } from "@mui/material";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import { useRef, useState } from "react";

import { useLogin } from "~/features/login/hooks/useLogin";

import { LoginErrorMesseage } from "../components/LoginErrorMesseage";

/**
 * Loginコンポーネント
 * @returns
 */
export const Login = (): JSX.Element => {
	const loginIdref = useRef<HTMLInputElement>(null);
	const passwordref = useRef<HTMLInputElement>(null);
	const [disabledLoginButton, setDisabledLoginButton] = useState(true);
	const { doLogin } = useLogin();
	// KeyDownイベント
	const handleKeyDown = (
		event: React.KeyboardEvent<HTMLInputElement>,
	): void => {
		if (event.key === "Enter") {
			if (
				loginIdref.current?.value.length !== 0 &&
				passwordref.current?.value.length !== 0
			) {
				doLogin(
					loginIdref.current?.value ?? "",
					passwordref.current?.value ?? "",
				);
			}
		}
	};

	// Changeイベント
	const handleChange = (): void => {
		if (
			!disabledLoginButton &&
			(loginIdref.current?.value.length === 0 ||
				passwordref.current?.value.length === 0)
		) {
			// ログインボタンを非活性
			setDisabledLoginButton(true);
		} else {
			if (
				disabledLoginButton &&
				loginIdref.current?.value.length !== 0 &&
				passwordref.current?.value.length !== 0
			) {
				// ログインボタンを活性
				setDisabledLoginButton(false);
			}
		}
	};

	// LOGINボタンクリックイベント
	const handleOnClick = (): void => {
		doLogin(loginIdref.current?.value ?? "", passwordref.current?.value ?? "");
	};

	return (
		<Container
			component="main"
			maxWidth="xs"
			sx={{
				marginTop: 15,
				display: "flex",
				flexDirection: "column",
				alignItems: "center",
			}}
		>
			<Avatar sx={{ m: 1, bgcolor: "secondary.main" }}>
				<LockOutlinedIcon />
			</Avatar>
			<Typography component="h1" variant="h5">
				MB-MMI GUI
			</Typography>
			<Box sx={{ mt: 1 }}>
				<TextField
					margin="normal"
					required
					fullWidth
					id="loginId"
					label="loginId"
					name="loginId"
					inputRef={loginIdref}
					onKeyDown={handleKeyDown}
					onChange={handleChange}
					autoFocus
					inputProps={{ "data-testid": "loginId-input" }}
				/>
				<TextField
					margin="normal"
					required
					fullWidth
					name="password"
					label="Password"
					type="password"
					id="password"
					inputRef={passwordref}
					onKeyDown={handleKeyDown}
					onChange={handleChange}
					inputProps={{ "data-testid": "password-input" }}
				/>
				<Box sx={{ height: "2vh" }}>
					<LoginErrorMesseage />
				</Box>
				<Button
					type="submit"
					fullWidth
					variant="contained"
					disabled={disabledLoginButton}
					onClick={handleOnClick}
					sx={{ mt: 3, mb: 2 }}
				>
					LOGIN
				</Button>
			</Box>
		</Container>
	);
};
