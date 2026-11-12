import { Container, PixiComponent } from "@pixi/react";
import {
	type DisplayObject as PixiDisplayObject,
	Rectangle as PixiRectangle,
	Sprite as PixiSprite,
	Texture as PixiTexture,
	Point,
} from "pixi.js";

import {
	type MapChipFilter,
	useSetMapChipFilter,
} from "~/features/defect-list/hooks/useDefect";
import { useMapSelectedSFov } from "~/features/misc/hooks/useMapSelectedSfov";

import { useContextMenuDisplay } from "../hooks/useContextMenuDisplay";
import {
	type SFovThumbnailDrawInfo,
	useSFovThumbnailDrawInfo,
} from "../hooks/useSFovThumbnailDrawInfo";
import type {
	HoverPointerPosition,
	HoverRegionChange,
	MapRegionKind,
} from "../types";

interface PixiComponentSFovProps {
	element: SFovThumbnailDrawInfo;
	idx: number;
	updateSelectedSFov: (imageid: number) => void;
	setMapChipFilter: (filter: MapChipFilter) => void;
	setIsContextMenuDisplay: (setIsContextMenuDisplay: boolean) => void;
	setContextMenuPoint: (contextMenuPoint: Point) => void;
	onAutoSelectDefect?: (region: MapChipFilter) => void;
	onHoverRegionChange?: HoverRegionChange;
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

export const SFOV_THUMBNAIL_SPRITE_NAME = "SFovThumbnailSprite";

// Clickイベントとドラッグイベントの判定用
let isMouseDown = false;
let isDragging = false;
let isRightMouseDown = false;

// スプライトシート情報のキャッシュ（mFOVごと）
const spriteSheetCache = new Map<
	string,
	{ thumbWidth: number; thumbHeight: number }
>();

export const setSpriteEventHandlers = (
	sprite: PixiSprite,
	props: PixiComponentSFovProps,
): void => {
	sprite.name = SFOV_THUMBNAIL_SPRITE_NAME;
	sprite.removeAllListeners("pointermove");
	sprite.removeAllListeners("pointerout");
	if (props.onHoverRegionChange != null) {
		sprite.on("pointermove", (event) => {
			const nativeEvent = event.nativeEvent as PointerEvent;
			props.onHoverRegionChange?.(
				{
					chipX: props.element.indexX,
					chipY: props.element.indexY,
					mFOVno: props.element.mfovno,
					sFOVno: props.element.sfovno,
				},
				{ x: nativeEvent.clientX, y: nativeEvent.clientY },
			);
		});
		sprite.on("pointerout", () => props.onHoverRegionChange?.(null));
	}
	sprite.onmousedown = () => {
		isMouseDown = true;
		isRightMouseDown = false;
	};
	sprite.onrightdown = () => {
		isMouseDown = true;
		isRightMouseDown = true;
	};
	sprite.onmousemove = () => {
		if (!isMouseDown || isDragging) return;
		isDragging = true;
	};
	sprite.onmouseup = (event) => {
		if (isRightMouseDown) return;
		if (isMouseDown && !isDragging) {
			const region = {
				chipX: props.element.indexX,
				chipY: props.element.indexY,
				mFOVno: props.element.mfovno,
				sFOVno: props.element.sfovno,
			};
			const nativeEvent = event.nativeEvent as PointerEvent | undefined;
			if (
				props.onMapRegionClickStart?.(
					"sFOV",
					region,
					nativeEvent == null
						? undefined
						: { x: nativeEvent.clientX, y: nativeEvent.clientY },
				) === false
			) {
				isMouseDown = false;
				isDragging = false;
				isRightMouseDown = false;
				return;
			}
			props.updateSelectedSFov(props.element.imageid);
			props.setMapChipFilter(region);
			props.onAutoSelectDefect?.(region);
			props.onMapRegionSelected?.("sFOV", region);
		}
		isMouseDown = false;
		isDragging = false;
		isRightMouseDown = false;
	};
	sprite.onrightup = (event) => {
		if (isRightMouseDown && isMouseDown && !isDragging) {
			props.updateSelectedSFov(props.element.imageid);
			props.setIsContextMenuDisplay(true);
			props.setContextMenuPoint(
				new Point(event.globalX + 60, event.globalY + 60),
			);
		}
		isDragging = false;
		isMouseDown = false;
		isRightMouseDown = false;
	};
};

export const SFovThumbnailComponent = PixiComponent<
	PixiComponentSFovProps,
	PixiDisplayObject
>("SFovThmubnail", {
	create: (): PixiDisplayObject => {
		return new PixiSprite() as PixiDisplayObject;
	},
	applyProps: (o, _oldProps, _newProps) => {
		const g = o as PixiSprite;

		// 既に子要素(sprite)が存在する場合、同じ位置なら再描画不要
		if (g.children.length > 0) {
			const existingSprite = g.children[0] as PixiSprite;
			if (
				existingSprite.x === _newProps.element.mfovImagePoints.x &&
				existingSprite.y === _newProps.element.mfovImagePoints.y
			) {
				setSpriteEventHandlers(existingSprite, _newProps);
				return g as PixiDisplayObject;
			}
			// 位置が異なる場合は古いspriteを削除して再描画
			g.removeChildren();
		}

		// スプライトシートからテクスチャを切り出す
		const sprite = new PixiSprite(PixiTexture.EMPTY);
		// 位置はワールド座標で設定
		sprite.x = _newProps.element.mfovImagePoints.x;
		sprite.y = _newProps.element.mfovImagePoints.y;
		// サイズはワールド座標で設定
		sprite.width = _newProps.element.width;
		sprite.height = _newProps.element.height;
		sprite.interactive = true;
		setSpriteEventHandlers(sprite, _newProps);

		g.addChild(sprite);

		// スプライトシートからテクスチャを切り出す
		const baseTexture = PixiTexture.from(_newProps.element.spriteSheetUrl);

		const applyTexture = () => {
			// キャッシュからサムネイルサイズを取得、なければ計算してキャッシュ
			let spriteInfo = spriteSheetCache.get(_newProps.element.spriteSheetUrl);
			if (!spriteInfo) {
				// スプライトシートは10x10グリッドなので、実際のサムネイルサイズを計算
				spriteInfo = {
					thumbWidth: baseTexture.baseTexture.width / 10,
					thumbHeight: baseTexture.baseTexture.height / 10,
				};
				spriteSheetCache.set(_newProps.element.spriteSheetUrl, spriteInfo);
			}

			// sfovno（1-91）からグリッド位置を計算
			const cols = 10;
			const spriteIndex = _newProps.element.sfovno - 1;
			const spriteX = (spriteIndex % cols) * spriteInfo.thumbWidth;
			const spriteY = Math.floor(spriteIndex / cols) * spriteInfo.thumbHeight;

			const frame = new PixiRectangle(
				spriteX,
				spriteY,
				spriteInfo.thumbWidth,
				spriteInfo.thumbHeight,
			);
			const croppedTexture = new PixiTexture(baseTexture.baseTexture, frame);
			sprite.texture = croppedTexture;

			// テクスチャ適用後にサイズを再設定（テクスチャのサイズに上書きされるため）
			sprite.width = _newProps.element.width;
			sprite.height = _newProps.element.height;
		};

		if (baseTexture.baseTexture.valid) {
			// 既に読み込み済み
			applyTexture();
		} else {
			// これから読み込まれる
			baseTexture.baseTexture.once("loaded", applyTexture);
		}

		return g as PixiDisplayObject;
	},
});

export const SFovThumbnail = (
	props: Pick<
		PixiComponentSFovProps,
		| "onAutoSelectDefect"
		| "onHoverRegionChange"
		| "onMapRegionClickStart"
		| "onMapRegionSelected"
	>,
): JSX.Element => {
	const { sFovThumbnailDrawInfos } = useSFovThumbnailDrawInfo();
	const { updateSelectedSFov } = useMapSelectedSFov();
	const setMapChipFilter = useSetMapChipFilter();
	const { setIsContextMenuDisplay, setContextMenuPoint } =
		useContextMenuDisplay();

	return (
		<Container>
			{sFovThumbnailDrawInfos.map((element) => (
				<Container key={element.imageid}>
					<SFovThumbnailComponent
						element={element}
						idx={element.imageid}
						updateSelectedSFov={updateSelectedSFov}
						setMapChipFilter={setMapChipFilter}
						setIsContextMenuDisplay={setIsContextMenuDisplay}
						setContextMenuPoint={setContextMenuPoint}
							onAutoSelectDefect={props.onAutoSelectDefect}
						onHoverRegionChange={props.onHoverRegionChange}
						onMapRegionClickStart={props.onMapRegionClickStart}
						onMapRegionSelected={props.onMapRegionSelected}
					/>
				</Container>
			))}
		</Container>
	);
};
