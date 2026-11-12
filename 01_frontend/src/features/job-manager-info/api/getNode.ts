import { ky } from "lib/ky";

import type { NodeData } from "../types";

export const getNode = async (signal: AbortSignal): Promise<NodeData[]> => {
	return await ky
		.get("nodes", { signal })
		.json<{ nodes: NodeData[] }>()
		.then((res) => res.nodes);
};
