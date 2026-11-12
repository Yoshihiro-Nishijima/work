import { ky } from "~/lib/ky";

export async function cancelDatasetCreation(id: string): Promise<void> {
	await ky.post(`datasets/${id}/cancel`);
}
