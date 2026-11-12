import { ky } from "lib/ky";

import type { LoginedUser } from "../types";

/** ログイン中ユーザ情報を取得 */
export const getLoginedUser = async (
	signal: AbortSignal,
): Promise<LoginedUser> => {
	return await ky.get("users/me", { signal }).json<LoginedUser>();
};
