import { ky } from "lib/ky";
import type {
	SearchParam,
	SearchResults,
} from "~/features/job-manager-info/types";
import type { DeleteProgressInfo } from "../types";

export const getDeleteProgressList = async (
	param: SearchParam,
	signal: AbortSignal,
): Promise<SearchResults<DeleteProgressInfo>> => {
	return await ky
		.post("delete-queue/search", { json: param, signal })
		.json<SearchResults<DeleteProgressInfo>>();
};
