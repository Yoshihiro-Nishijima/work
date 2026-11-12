import { atom, useAtomValue, useSetAtom } from "jotai";

import { DOMAIN_HOST, LOGIN_URL } from "~/config";

import { postLogin } from "../api/postLogin";
import { postLogout } from "../api/postLogout";
import type { LoginParam } from "../types";

const isLoginSuccessAtom = atom(true);

interface UseLogin {
	doLogin: (loginId: string, password: string) => () => void;
	doLogout: () => () => void;
}

export const useLoginSuccess = (): boolean => {
	return useAtomValue(isLoginSuccessAtom);
};

export const useLogin = (): UseLogin => {
	const setIsLoginSuccess = useSetAtom(isLoginSuccessAtom);
	const doLogin = (loginId: string, password: string): (() => void) => {
		const controller = new AbortController();
		const param: LoginParam = { loginId, password };
		postLogin(param, controller.signal)
			.then((_res) => {
				setIsLoginSuccess(true);
				const url = document.referrer;
				if (url.startsWith(DOMAIN_HOST) && !url.startsWith(LOGIN_URL)) {
					window.location.href = url;
				} else {
					window.location.href = "/";
				}
			})
			.catch((error) => {
				if (error.name === "AbortError") return;
				// ログイン失敗
				setIsLoginSuccess(false);
				console.error("Login fail.", error);
			});
		return () => {
			controller.abort();
		};
	};

	const doLogout = (): (() => void) => {
		const controller = new AbortController();
		postLogout(controller.signal)
			.then((_res) => {
				// 処理なし
			})
			.catch((error) => {
				if (error.name === "AbortError") return;
				// ログアウト失敗
				console.error("Logout fail.", error);
			})
			.finally(() => {
				setIsLoginSuccess(false);
				window.location.href = LOGIN_URL;
			});

		return () => {
			controller.abort();
		};
	};

	return {
		doLogin,
		doLogout,
	};
};
