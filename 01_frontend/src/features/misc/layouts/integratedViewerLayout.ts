export const INTEGRATED_VIEWER_INFO_AREA_HEIGHT = 176;

export const getIntegratedViewerMapHeight = (
	viewportHeight: number,
	titleBarHeight: number,
): number =>
	viewportHeight -
	titleBarHeight -
	INTEGRATED_VIEWER_INFO_AREA_HEIGHT;