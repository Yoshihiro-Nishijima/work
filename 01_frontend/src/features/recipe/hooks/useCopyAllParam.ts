import { useAtomCallback } from "jotai/utils";
import { useCallback } from "react";
import { updateAllADC } from "./useADCParam";
import { areaNosAtom } from "./useAreaNos";
import { updateAllCorrection } from "./useCorrectionParam";
import { updateAllInspection } from "./useInspectionParam";
import { updateAllMatching } from "./useMatchingParam";
import { editAreaNosAtom } from "./useRecipeModeParam";

interface UseCopyAllParam {
	copyAllParams: () => Promise<void>;
}

/** モード別パラメータ一括適用 */
export const useCopyAllParam = (): UseCopyAllParam => {
	const copyAllParams = useAtomCallback(
		useCallback(async (get, set) => {
			await set(updateAllCorrection);
			await set(updateAllInspection);
			await set(updateAllADC);
			await set(updateAllMatching);
			// 全てのAreaNoが更新されたので、editNoAtomにセット
			set(editAreaNosAtom, await get(areaNosAtom));
		}, []),
	);
	return {
		copyAllParams,
	};
};
