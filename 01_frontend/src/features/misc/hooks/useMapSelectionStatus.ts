import { atom, useAtom, useAtomValue, useSetAtom } from "jotai";
import { Point } from "pixi.js";
import { useEffect, useMemo, useState } from "react";
import type { Dispatch, SetStateAction } from "react";

import {
	type MapChipFilter,
	useSetMapChipFilter,
} from "~/features/defect-list/hooks/useDefect";
import type {
	HoverPointerPosition,
	MapRegionKind,
} from "~/features/integrated-viewer-map/types";
import { useChipMapInfo } from "~/features/integrated-viewer-map/hooks/useChipMapInfo";
import { useChipDefects, useIdw } from "~/features/map/hooks";

import { useFovList } from "~/features/s-fov-list/hooks/useFovList";
import { useMapClickedStatus } from "./useMapClickedStatus";
import { useSelectedDefect } from "./useSelectedDefect";

export const DEFAULT_SELECTED_CHIP_INDEX = new Point(0, 0);

// 統合Viewerで選択中のChip(IDW上のChip座標)
const selectedChipIndexAtom = atom(DEFAULT_SELECTED_CHIP_INDEX);

interface UseMapSelectionStatus {
	selectedChipIndex: Point;
	setSelectedChipIndex: Dispatch<SetStateAction<Point>>;
	selectedSfovPixelPoint: Point | undefined;
	selectedDefectPixelPoint: Point | undefined;
	isFirstSelect: boolean;
	setIsFirstSelect: Dispatch<SetStateAction<boolean>>;
}

interface UseMapSelectionStatusOptions {
	isChipClickHandler?: boolean;
	onChipFilterApplied?: (region: MapChipFilter) => void;
	onMapRegionClickStart?: (
		regionKind: MapRegionKind,
		region: MapChipFilter,
		pointerPosition?: HoverPointerPosition,
	) => boolean;
	onMapRegionSelected?: (
		regionKind: MapRegionKind,
		region: MapChipFilter,
	) => void;
}

export const useSelectedChipValue = () => useAtomValue(selectedChipIndexAtom);
export const useSetSelectedChip = () => useSetAtom(selectedChipIndexAtom);

export const useMapSelectionStatus = ({
	isChipClickHandler = false,
	onChipFilterApplied,
	onMapRegionClickStart,
	onMapRegionSelected,
}: UseMapSelectionStatusOptions = {}): UseMapSelectionStatus => {
	const [selectedChipIndex, setSelectedChipIndex] = useAtom(
		selectedChipIndexAtom,
	);
	const setMapChipFilter = useSetMapChipFilter();
	const [isFirstSelect, setIsFirstSelect] = useState(false);

	const {
		clickedPoint,
		clickedButton,
		clickedTargetName,
		clientPosition,
		clickEvent,
		setClickedPoint,
	} = useMapClickedStatus();
	const { selectedFov } = useFovList();
	const { selectedDefect } = useSelectedDefect();
	const {
		idw,
		toDrawChipIndex,
		toIdwChipIndex,
		calcDrawChipIndex,
		toDrawChipPoint,
	} = useIdw();
	const { chipMapInfo } = useChipMapInfo();
	const { enableChipSet } = useChipDefects();
	// 選択中sFov変更時の処理
	const selectedSfovPixelSelector = atom((_get) => {
		if (selectedFov == null || idw == null) return undefined;
		// sFov情報のcoordX,coordYからピクセル上のsFovのTop-Leftの座標を計算する(Map付帯情報-Positionボタンのため)
		const drawChipIndex = toDrawChipIndex(
			new Point(selectedFov.indexX, selectedFov.indexY),
		);
		const chipOriginPoint = new Point(
			drawChipIndex.x * chipMapInfo.pixelSizeX,
			drawChipIndex.y * chipMapInfo.pixelSizeY,
		);
		// Chip内座標を取得
		const sfovDrawChipPoint = toDrawChipPoint(
			chipMapInfo.pixelSizeX,
			chipMapInfo.pixelSizeY,
			new Point(selectedFov.coordX, selectedFov.coordY),
		);
		// World座標を計算(sFOVは左下起点)
		return new Point(
			chipOriginPoint.x + sfovDrawChipPoint.x,
			chipOriginPoint.y + chipMapInfo.pixelSizeY - sfovDrawChipPoint.y,
		);
	});
	const selectedSfovPixelPoint = useAtomValue(
		// biome-ignore lint/correctness/useExhaustiveDependencies: selectedFov,idw変更契機のみ更新。selectedSfovPixelPointの依存配列への設定は無限ループになるため対象外とする。
		useMemo(() => selectedSfovPixelSelector, [selectedFov, idw]),
	);

	if (selectedFov != null && !isFirstSelect) setIsFirstSelect(true);

	// 選択中defect変更時の処理
	const selectedDefectPixelPointSelector = atom((_get) => {
		if (selectedDefect == null || idw == null) return undefined;
		// Defect情報のcoordX,coordYからピクセル上のDefectのTop-Leftの座標を計算する(Map付帯情報-Positionボタンのため)
		const drawChipIndex = toDrawChipIndex(
			new Point(selectedDefect.chipX, selectedDefect.chipY),
		);
		const chipOriginPoint = new Point(
			drawChipIndex.x * chipMapInfo.pixelSizeX,
			drawChipIndex.y * chipMapInfo.pixelSizeY,
		);
		// Chip内座標を取得
		const defectDrawChipPoint = toDrawChipPoint(
			chipMapInfo.pixelSizeX,
			chipMapInfo.pixelSizeY,
			new Point(selectedDefect.coordX, selectedDefect.coordY),
		);
		// World座標を計算(Defectは左上起点)
		return new Point(
			defectDrawChipPoint.x + chipOriginPoint.x,
			chipMapInfo.pixelSizeY - defectDrawChipPoint.y + chipOriginPoint.y,
		);
	});
	const selectedDefectPixelPoint = useAtomValue(
		// biome-ignore lint/correctness/useExhaustiveDependencies: selectedDefect,idw変更契機のみ更新。selectedDefectPixelPointの依存配列への設定は無限ループになるため対象外とする。
		useMemo(() => selectedDefectPixelPointSelector, [selectedDefect, idw]),
	);

	// Map部をクリックした場合、選択中Chipにセットする
	// biome-ignore lint/correctness/useExhaustiveDependencies: effect内でselectedChipIndexを更新しているので監視不可
	useEffect(() => {
		if (!isChipClickHandler || idw?.mapOrigin == null || clickedPoint == null) {
			return;
		}
		const drawChipIndex = calcDrawChipIndex(
			clickedPoint,
			chipMapInfo.pixelSizeX,
			chipMapInfo.pixelSizeY,
		);
		const idwChipIndex = toIdwChipIndex(drawChipIndex);

		// データ無し(defectCount未設定)の場合はchip選択状態変更を抑止
		const key = `${drawChipIndex.x},${drawChipIndex.y}`;
		const isEnabledChip = enableChipSet.has(key);
		if (!isEnabledChip) return;

		const region = { chipX: idwChipIndex.x, chipY: idwChipIndex.y };
		const isLeftBackgroundClick =
			clickEvent != null &&
			clickedButton === 0 &&
			(clickedTargetName == null || clickedTargetName === "");
		if (
			isLeftBackgroundClick &&
			onMapRegionClickStart?.("chip", region, clientPosition) === false
		) {
			setClickedPoint(undefined);
			return;
		}
		setMapChipFilter(region);

		// 選択中Chipがクリックされた場合は視覚選択を更新しない
		if (!idwChipIndex.equals(selectedChipIndex)) {
			setSelectedChipIndex(idwChipIndex);
		}
		if (isLeftBackgroundClick) {
			onChipFilterApplied?.(region);
			onMapRegionSelected?.("chip", region);
		}
		setClickedPoint(undefined);
	}, [
		idw?.mapOrigin,
		isChipClickHandler,
		enableChipSet,
		clickedPoint,
		clickEvent,
		clickedButton,
		clickedTargetName,
		clientPosition,
		onChipFilterApplied,
		onMapRegionClickStart,
		onMapRegionSelected,
		setMapChipFilter,
		setClickedPoint,
		toIdwChipIndex,
		setSelectedChipIndex,
		calcDrawChipIndex,
	]);
	return {
		selectedChipIndex,
		setSelectedChipIndex,
		selectedSfovPixelPoint,
		selectedDefectPixelPoint,
		isFirstSelect,
		setIsFirstSelect,
	};
};
