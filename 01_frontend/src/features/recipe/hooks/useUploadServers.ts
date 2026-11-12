import { useCallback, useEffect, useState } from "react";
import { getUploadConfig } from "~/features/upload-config/api";

export interface UseUploadServers {
	uploadServers: string[];
	fetchUploadServers: () => Promise<string[]>;
}

export const useUploadServers = (): UseUploadServers => {
	const [uploadServers, setUploadServers] = useState<string[]>([]);

	const fetchUploadServers = useCallback(async (): Promise<string[]> => {
		try {
			const res = await getUploadConfig();
			const servers = res.servers.map((srv) => srv.name);
			setUploadServers(servers);
			return servers;
		} catch (error) {
			setUploadServers([]);
			console.error("getUploadServers fetch fail.", error);
			return [];
		}
	}, []);

	useEffect(() => {
		void fetchUploadServers();
	}, [fetchUploadServers]);

	return { uploadServers, fetchUploadServers };
};
