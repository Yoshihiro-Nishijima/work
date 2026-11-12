import { ky } from "lib/ky";

import type { LoginParam } from "../types";

export const postLogin = async (
	param: LoginParam,
	signal: AbortSignal,
): Promise<unknown> => {
	return await ky
		.post("auth/login", {
			json: { login_id: param.loginId, password: param.password },
			signal,
		})
		.json();
};
