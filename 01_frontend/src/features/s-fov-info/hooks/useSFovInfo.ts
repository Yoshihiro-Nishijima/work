import { useAtomValue } from "jotai";
import { useCallback, useEffect, useState } from "react";
import type { DefectRecord } from "~/features/defect-list/types";
import { useSFovViewModal } from "~/features/integrated-viewer-sfov-view/hooks/useSFovViewModal";
import { useMfovnoForSEMImage } from "~/features/map/hooks/useMfovnoForSEMImage";
import { useSfovnoForSEMImage } from "~/features/map/hooks/useSfovnoForSEMImage";
import { useResultName } from "~/features/misc/hooks/useResultName";
import { selectedDefectAtom } from "~/features/misc/hooks/useSelectedDefect";
import { getFovInfo } from "~/features/recipe/api/getFovInfo";
import type { modeFov } from "~/features/recipe/types";
import { useFovList } from "~/features/s-fov-list/hooks/useFovList";
import type { Fov } from "~/features/s-fov-list/types";
import { useTrainingMode } from "~/features/training-mode/hooks/useTrainingMode";

// SFov付帯情報を取得
export const useSFovInfo = (): modeFov | undefined => {
	const [fov, setFov] = useState<modeFov>();
	const { resultName } = useResultName();
	const { selectedFov, selectedFovListForTraining } = useFovList();
	const { mfovnoForSEMImage } = useMfovnoForSEMImage();
	const { sfovnoForSEMImage } = useSfovnoForSEMImage();
	const { isSFovViewModalOpen } = useSFovViewModal();
	const selectedDefect = useAtomValue(selectedDefectAtom);
	const { isTrainingMode } = useTrainingMode();

	// 選択条件からsFOV情報取得対象の fovNo(mFovNo, sFovNo) を取得
	const getFovNos = useCallback(
		(
			isSFovViewModalOpen: boolean,
			isTrainingMode: boolean,
			selectedFovListForTraining: Fov[],
			mfovnoForSEMImage?: number,
			sfovnoForSEMImage?: number,
			selectedDefect?: DefectRecord,
			selectedFov?: Fov,
		): { mFovNo: number; sFovNo: number } | undefined => {
			if (selectedDefect != null) {
				return { mFovNo: selectedDefect.mFOVno, sFovNo: selectedDefect.sFOVno };
			}
			if (isSFovViewModalOpen) {
				if (!mfovnoForSEMImage || !sfovnoForSEMImage) return undefined;
				return { mFovNo: mfovnoForSEMImage, sFovNo: sfovnoForSEMImage };
			}
			if (isTrainingMode) {
				if (selectedFovListForTraining.length === 0) return undefined;
				return {
					mFovNo: selectedFovListForTraining[0].mfovno,
					sFovNo: selectedFovListForTraining[0].sfovno,
				};
			}
			if (selectedFov != null) {
				return { mFovNo: selectedFov.mfovno, sFovNo: selectedFov.sfovno };
			}
			return undefined;
		},
		[],
	);
	const fovNos = getFovNos(
		isSFovViewModalOpen,
		isTrainingMode,
		selectedFovListForTraining,
		mfovnoForSEMImage,
		sfovnoForSEMImage,
		selectedDefect,
		selectedFov,
	);

	useEffect(() => {
		if (resultName.length === 0) return;

		if (fovNos == null) {
			setFov(undefined);
			return;
		}
		if (fovNos.mFovNo === 0 || fovNos.sFovNo === 0) return;
		if (
			fov != null &&
			fov.mfovNo === fovNos.mFovNo &&
			fov.sfovNo === fovNos.sFovNo
		) {
			return;
		}

		const controller = new AbortController();
		getFovInfo({ resultName, ...fovNos }, controller.signal)
			.then(setFov)
			.catch((error) => {
				if (error.name === "AbortError") return;
				console.error("getFovInfo fetch fail.", error);
			});

		return () => {
			controller.abort();
		};
	}, [resultName, fovNos, fov]);

	return fov;
};
