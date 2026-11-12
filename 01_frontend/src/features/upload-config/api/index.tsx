import { ky } from "lib/ky";

import type { KlarfVersion, Server, ServerRow, UploadConfig } from "../types";

export const getUploadConfig = async (): Promise<UploadConfig> => {
	return await ky.get("config/upload").json<UploadConfig>();
};

export const putUploadConfig = async (
	klarfVersion: KlarfVersion,
	serverRows: ServerRow[],
): Promise<boolean> => {
	const servers: Server[] = serverRows.map((r) => {
		return { name: r.name, address: r.address, dir: r.dir };
	});
	const toSave: UploadConfig = { servers, version: klarfVersion };
	return await ky
		.put("config/upload", { json: toSave })
		.then((r) => {
			return r.ok;
		})
		.catch(() => {
			return false;
		});
};
