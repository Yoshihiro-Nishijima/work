import { ky } from "~/lib/ky";

export async function deleteDataset(
	datasetType: string,
	name: string,
	signal?: AbortSignal,
): Promise<unknown> {
	return await ky.delete(`datasets/${datasetType}/${name}`, { signal }).json();
}
