import { atom, useAtomValue } from "jotai";
import { useAtomCallback } from "jotai/utils";
import { useCallback } from "react";

import { getLoginedUser } from "../api/getLoginedUser";
import type { LoginedUser } from "../types";

const loginedUserAtom = atom<LoginedUser | undefined>(undefined);

interface UseLoginedUser {
	loginedUser?: LoginedUser;
	setLoginedUser: () => void;
}

export const useLoginedUser = (): UseLoginedUser => {
	const loginedUser = useAtomValue(loginedUserAtom);
	const setLoginedUser = useAtomCallback(
		useCallback((_, set) => {
			const controller = new AbortController();
			getLoginedUser(controller.signal)
				.then((res) => {
					set(loginedUserAtom, res);
				})
				.catch((error) => {
					if (error.name === "AbortError") return;
					console.error("get Logined User fail.", error);
				});
			return () => {
				controller.abort();
			};
		}, []),
	);
	return { loginedUser, setLoginedUser };
};
