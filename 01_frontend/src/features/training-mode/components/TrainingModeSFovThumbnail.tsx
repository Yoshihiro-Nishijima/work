import { Container, PixiComponent } from "@pixi/react";
import { useAtomValue } from "jotai";
import {
	type DisplayObject as PixiDisplayObject,
	Sprite as PixiSprite,
	Point,
} from "pixi.js";
import {
	type Dispatch,
	type SetStateAction,
	useMemo,
	useRef,
	useState,
} from "react";

import { useContextMenuDisplay } from "~/features/integrated-viewer-map/hooks/useContextMenuDisplay";
import {
	type SFovThumbnailDrawInfo,
	useSFovThumbnailDrawInfo,
} from "~/features/integrated-viewer-map/hooks/useSFovThumbnailDrawInfo";
import type { DisplayPoint } from "~/features/integrated-viewer-map/types";
import { useSelectedSFovImageIdList } from "~/features/misc/hooks/useSelectedSFovImageIdList";
import { getPickedFovImageIdListAtom } from "~/features/s-fov-list/hooks/usePickedFov";

import { useMapSelectedSFov } from "~/features/misc/hooks/useMapSelectedSfov";
import { useMapContextMenuSFov } from "../hooks/useMapContextMenuSFov";

interface DispSFovInfo {
	mfovno: number;
	sfovno: number;
}

interface PixiComponentSFovProps {
	element: SFovThumbnailDrawInfo;
	idx: number;
	setIsContextMenuDisplay: (setIsContextMenuDisplay: boolean) => void;
	setContextMenuPoint: (contextMenuPoint: Point) => void;
	dispSFovInfo: DispSFovInfo[];
	setDispSFovInfo: Dispatch<SetStateAction<DispSFovInfo[]>>;
	lastSelectedSFov: React.RefObject<SFovThumbnailDrawInfo | undefined>;
	updateLastSelectedSFov: (mfov: SFovThumbnailDrawInfo) => void;
	drawsFovInfos: SFovThumbnailDrawInfo[];
	addById: (addImageIdList: number[]) => void;
	remove: (removeImageIdList: number[]) => void;
	toggle: (toggleImageId: number) => void;
	setContextMenuSFov: (sfov: SFovThumbnailDrawInfo | undefined) => void;
	updateSelectedSFov: (imageid: number) => void;
}

export const onSelectSFovs = (
	event: MouseEvent,
	_newProps: PixiComponentSFovProps,
): void => {
	const selectedRange: DisplayPoint = {
		canvasMinX: -1,
		canvasMaxX: -1,
		canvasMinY: -1,
		canvasMaxY: -1,
	};
	if (_newProps.lastSelectedSFov.current != null && event.shiftKey) {
		// 前回サムネイルクリック済み かつ shiftキー押下中ならば
		// クリックしたサムネイル～前回クリックしたサムネイルの範囲内を選択する

		// 前回と今回選択したサムネイルの中心座標を取得
		const centerX = [
			_newProps.lastSelectedSFov.current?.mfovImagePoints.x +
				_newProps.lastSelectedSFov.current?.width / 2,
			_newProps.element.mfovImagePoints.x + _newProps.element.width / 2,
		].toSorted((a, b) => a - b);
		const centerY = [
			_newProps.lastSelectedSFov.current?.mfovImagePoints.y +
				_newProps.lastSelectedSFov.current?.height / 2,
			_newProps.element.mfovImagePoints.y + _newProps.element.height / 2,
		].toSorted((a, b) => a - b);

		// 選択範囲を中心座標から画像サイズ/4だけ広げる (範囲境界がサムネイル境界に重なる場合、選択状態にする)
		// サムネイルはオフセット等でずれるため、多少枠を広げて判定する必要がある。
		// サムネイルはX軸方向には画像サイズ/2単位に配置されるため、その半分(画像サイズ/4)をずれの許容上限とする
		selectedRange.canvasMinX = centerX[0] - _newProps.element.width / 4;
		selectedRange.canvasMaxX = centerX[1] + _newProps.element.width / 4;
		selectedRange.canvasMinY = centerY[0] - _newProps.element.height / 4;
		selectedRange.canvasMaxY = centerY[1] + _newProps.element.height / 4;

		// 選択範囲と重なるサムネイルを取得
		const addImageIdList = _newProps.drawsFovInfos
			.filter((e): boolean => {
				return (
					selectedRange.canvasMinX < e.mfovImagePoints.x + e.width &&
					e.mfovImagePoints.x < selectedRange.canvasMaxX &&
					selectedRange.canvasMinY < e.mfovImagePoints.y + e.height &&
					e.mfovImagePoints.y < selectedRange.canvasMaxY
				);
			})
			.map((e): number => e.imageid);
		_newProps.addById(addImageIdList);
		_newProps.updateLastSelectedSFov(_newProps.element);
	} else {
		// 前回サムネイルクリックなし or shiftキー押下なしならば
		// クリックしたサムネイルの選択状態を変更する
		_newProps.toggle(_newProps.element.imageid);
		_newProps.updateLastSelectedSFov(_newProps.element);
	}
	_newProps.updateSelectedSFov(_newProps.element.imageid);
};

// Clickイベントとドラッグイベントの判定用
let isMouseDown = false;
let isDragging = false;

export const TrainingModeSFovThumbnailComponent = PixiComponent<
	PixiComponentSFovProps,
	PixiDisplayObject
>("TrainingModeSFovThmubnail", {
	create: (): PixiDisplayObject => {
		return new PixiSprite() as PixiDisplayObject;
	},
	applyProps: (o, _oldProps, _newProps) => {
		const g = o as PixiSprite;

		if (
			_newProps.dispSFovInfo.some(
				(value: DispSFovInfo) =>
					value.mfovno === _newProps.element.mfovno &&
					value.sfovno === _newProps.element.sfovno,
			)
		) {
			g.onmouseup = (event) => {
				if (!isDragging) {
					// ドラッグ中でなければ sFov選択
					onSelectSFovs(event, _newProps);
				}
				isMouseDown = false;
				isDragging = false;
			};
			return g as PixiDisplayObject;
		}

		_newProps.setDispSFovInfo((dispSFovInfo) =>
			dispSFovInfo.concat({
				mfovno: _newProps.element.mfovno,
				sfovno: _newProps.element.sfovno,
			}),
		);

		const sprite = PixiSprite.from(_newProps.element.imageUrl);
		sprite.x = _newProps.element.mfovImagePoints.x;
		sprite.y = _newProps.element.mfovImagePoints.y;
		sprite.width = _newProps.element.width;
		sprite.height = _newProps.element.height;

		sprite.interactive = true;

		sprite.onmousedown = (_event) => {
			isMouseDown = true;
		};
		sprite.onrightdown = (_event) => {
			isMouseDown = true;
		};

		sprite.onmousemove = (_event) => {
			if (!isMouseDown || isDragging) return;
			// ドラッグ開始
			isDragging = true;
		};

		sprite.onmouseup = (event) => {
			if (!isDragging) {
				// ドラッグ中でなければ sFov選択
				onSelectSFovs(event, _newProps);
			}
			isMouseDown = false;
			isDragging = false;
		};

		sprite.onrightup = (event) => {
			if (!isDragging) {
				// ドラッグ中でなければコンテキストメニュー表示
				_newProps.setContextMenuSFov(_newProps.element);
				// 変更許可
				_newProps.setIsContextMenuDisplay(true);
				// コンテキストメニュー表示
				_newProps.setContextMenuPoint(
					new Point(event.globalX + 60, event.globalY + 60),
				);
			}
			isDragging = false;
			isMouseDown = false;
		};

		g.addChild(sprite);

		return g as PixiDisplayObject;
	},
});

export const TrainingModeSFovThumbnail = (): JSX.Element => {
	const { sFovThumbnailDrawInfos } = useSFovThumbnailDrawInfo();
	const { setIsContextMenuDisplay, setContextMenuPoint } =
		useContextMenuDisplay();
	const { updateSelectedSFov } = useMapSelectedSFov();
	// 描画済み判定用
	const [dispSFovInfo, setDispSFovInfo] = useState<DispSFovInfo[]>([]);
	const lastSelectedSFov = useRef<SFovThumbnailDrawInfo | undefined>(undefined);
	const { addById, remove, toggle } = useSelectedSFovImageIdList();
	const { setMapContextMenuSFov } = useMapContextMenuSFov();
	// Picked用
	const pickedFovImageIdList = useAtomValue(getPickedFovImageIdListAtom);
	const [isDisplayedPicked, setIsDisplayedPicked] = useState(false);

	const hasPickedImageIds = pickedFovImageIdList.length !== 0;
	if (isDisplayedPicked && !hasPickedImageIds) {
		// Picked ON->Picked OFFに戻る際の処理
		setDispSFovInfo([]);
		setIsDisplayedPicked(false);
	} else if (!isDisplayedPicked && hasPickedImageIds) {
		// Picked ONになった直後
		setIsDisplayedPicked(true);
	}

	const updateLastSelectedSFov = (mfov: SFovThumbnailDrawInfo): void => {
		lastSelectedSFov.current = mfov;
	};

	// Picked時の表示サムネイルフィルタ
	const drawsFovInfos = hasPickedImageIds
		? sFovThumbnailDrawInfos.filter((e) =>
				pickedFovImageIdList.includes(e.imageid),
			)
		: sFovThumbnailDrawInfos;

	// biome-ignore lint/correctness/useExhaustiveDependencies: contextMenuSFovはこのコンポーネントの描画には使用しないため監視対象外とする
	return useMemo(
		() => (
			<Container>
				{drawsFovInfos.map((element) => (
					<Container key={element.imageid}>
						<TrainingModeSFovThumbnailComponent
							element={element}
							idx={element.imageid}
							setIsContextMenuDisplay={setIsContextMenuDisplay}
							setContextMenuPoint={setContextMenuPoint}
							dispSFovInfo={dispSFovInfo}
							setDispSFovInfo={setDispSFovInfo}
							lastSelectedSFov={lastSelectedSFov}
							updateLastSelectedSFov={updateLastSelectedSFov}
							drawsFovInfos={drawsFovInfos}
							addById={addById}
							remove={remove}
							toggle={toggle}
							setContextMenuSFov={setMapContextMenuSFov}
							updateSelectedSFov={updateSelectedSFov}
						/>
					</Container>
				))}
			</Container>
		),
		[
			sFovThumbnailDrawInfos,
			setIsContextMenuDisplay,
			setContextMenuPoint,
			dispSFovInfo,
			setDispSFovInfo,
			addById,
			remove,
			toggle,
		],
	);
};
