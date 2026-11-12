import { ky } from "lib/ky";

export const deleteADCModel = async (
	adcName: string,
	signal: AbortSignal,
): Promise<unknown> => {
	return await ky.delete(`adc/${adcName}`, { signal }).json();
};
