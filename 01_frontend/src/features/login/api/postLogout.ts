import { ky } from "lib/ky";

export const postLogout = async (signal: AbortSignal): Promise<unknown> => {
	return await ky
		.post("auth/logout", {
			signal,
		})
		.json();
};
