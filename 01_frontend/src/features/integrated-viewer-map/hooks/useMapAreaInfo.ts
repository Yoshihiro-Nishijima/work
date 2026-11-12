// MapAreaのブラウザ内有効サイズを算出
import { atom, useAtomValue } from "jotai";

import { WAFERMAP_AREA_WIDTH } from "~/features/integrated-viewer-map-info/components/WaferMap";
import { getIntegratedViewerMapHeight } from "~/features/misc/layouts/integratedViewerLayout";
// import { useLayoutEffect } from 'react' //TODO：useLayoutEffect(途中でのブラウザリサイズ契機)対応時

export const INTEGRATED_VIEWER_MENU_WIDTH = 57;
export const INTEGRATED_VIEWER_MAP_INFO_WIDTH = WAFERMAP_AREA_WIDTH;
// TitleBarの高さ(32px) + Border(1px × 2)
export const INTEGRATED_VIEWER_MAP_TITLEBAR_HEIGHT = 34;
export const PADDING = 55;

export const integratedMapAreaWidthAtom = atom((_get) => {
	return (
		window.innerWidth -
		INTEGRATED_VIEWER_MENU_WIDTH -
		INTEGRATED_VIEWER_MAP_INFO_WIDTH
	);
});

export const integratedMapAreaHeightAtom = atom((_get) => {
  return getIntegratedViewerMapHeight(
    window.innerHeight,
    INTEGRATED_VIEWER_MAP_TITLEBAR_HEIGHT,
  );
});

interface UseMapAreaInfo {
	integratedMapAreaWidth: number;
	integratedMapAreaHeight: number;
}

/** Atomを返すだけだが、コンポーネントから直接Atom参照させないために提供 */
export const useMapAreaInfo = (): UseMapAreaInfo => {
	/*
  //TODO:途中でのブラウザリサイズ契機に対応する場合は、こちらの形にする必要あり。
  //     ただし、こちらの処理にした場合、chip選択枠やdefect描画などがずれる(viewport上の座標リサイズが行われない部分がある)
  //     ため、MAP部全体再描画の検討が必要(useChipMapInfo.tsのpixelSizeをリサイズ契機に更新できれば対応できる可能性あり）。
  useLayoutEffect(() => {
    const updateSize = (): void => {
      const mapWidth = window.innerWidth - INTEGRATED_VIEWER_MENU_WIDTH - INTEGRATED_VIEWER_MAP_INFO_WIDTH
      const mapHeight = window.innerHeight - INTEGRATED_VIEWER_MAP_TITLEBAR_HEIGHT
      setIntegratedMapAreaWidth(mapWidth)
      setIntegratedMapAreaHeight(mapHeight)
    }

    window.addEventListener('resize', updateSize)
    updateSize()

    return () => { window.removeEventListener('resize', updateSize) }
    // 初回のみ実施（イベントリスナー登録)
  }, [])
  */

	return {
		integratedMapAreaWidth: useAtomValue(integratedMapAreaWidthAtom),
		integratedMapAreaHeight: useAtomValue(integratedMapAreaHeightAtom),
	};
};
