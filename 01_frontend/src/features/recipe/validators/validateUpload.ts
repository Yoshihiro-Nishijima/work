import type { ErrorMessage } from "~/components/types/ErrorMessageType";
import type { UploadParam } from "../types";

export const SERVER_NOT_FOUND = "The specified server does not exist.";
export const validateUpload = (
	uploads: UploadParam[],
	uploadServers: string[],
): ErrorMessage => {
	const errors: ErrorMessage = [];

	uploads.forEach((upload, index) => {
		if (!upload.enabled) return;

		const server = upload.server;
		const loc = ["common", "upload", index, "server"];

		if (server == null || !uploadServers.includes(server)) {
			errors.push({ loc, msg: SERVER_NOT_FOUND, type: "server_not_found" });
		}
	});

	return errors;
};
