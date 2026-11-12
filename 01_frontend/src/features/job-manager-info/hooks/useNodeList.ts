import { useEffect, useState } from "react";

import { getNode } from "../api/getNode";
import type { NodeData } from "../types";

export const useNodeList = (): { nodeList: NodeData[] } => {
	const [nodeList, setNodeList] = useState<NodeData[]>([]);
	useEffect(() => {
		const controller = new AbortController();
		getNode(controller.signal)
			.then((res) => {
				setNodeList(res);
			})
			.catch((error) => {
				if (error.name === "AbortError") return;
				console.error("getNode fetch fail.", error);
			});
		return () => {
			controller.abort();
		};
	}, []);
	return { nodeList };
};
