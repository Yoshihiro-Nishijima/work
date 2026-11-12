import { Box } from "@mui/system";
import {
	useCallback,
	useEffect,
	useLayoutEffect,
	useRef,
	useState,
} from "react";

import { DOMAIN_API } from "~/config";
import { useModel } from "~/features/misc/hooks/useModel";
import { useScroll } from "~/features/misc/hooks/useScroll";
import { useSegmentationImageList } from "~/features/segmentation-image-list/hooks/useSegmentationImageList";

import { clamp } from "~/utils/numUtils";
import classes from "../css/style.module.css";
import { useHtmlOverlay } from "../hooks/useHtmlOverlay";
import { useSegmentationImageViewProp } from "../hooks/useSegmentationImageViewProp";
import { maxMagnification, minMagnification } from "./SegmentationMenu";

export const SegmentationSEMImage = (): JSX.Element => {
	const { model } = useModel();
	const { selectedFov } = useSegmentationImageList();

	// mousedown時のマウスとスクロールの座標
	const [mousescrollstate, setmousescrollstate] = useState({
		isdown: false,
		mouse_x: 0,
		mouse_y: 0,
		scroll_x: 0,
		scroll_y: 0,
	});

	const panelRef = useRef<HTMLDivElement>(null);
	const divRef = useRef<HTMLDivElement>(null);
	const semImageRef = useRef<HTMLImageElement>(null);
	const overlay = useHtmlOverlay();

	const { imageViewProp, setMagnification, setViewWH, setCenterXY } =
		useSegmentationImageViewProp();
	const { scroll, setScroll } = useScroll();

	const segmentationOpacity = (100.0 - imageViewProp.segmentationAlpha) / 100.0;
	const isHiddenSegmentation = !imageViewProp.showSegmentation;

	const wheelZoomRatio = 1.1;

	// Resize処理
	const Resize = useCallback(() => {
		if (
			panelRef.current == null ||
			divRef.current == null ||
			semImageRef.current == null ||
			overlay.overlay.imgRef.current == null
		)
			return;

		// SEM画像のResize処理
		const semImage = semImageRef.current;
		if (semImage.complete) {
			semImage.width = semImage.naturalWidth * imageViewProp.magnification;
			semImage.height = semImage.naturalHeight * imageViewProp.magnification;
		}
		const size = {
			width: semImage.naturalWidth * imageViewProp.magnification,
			height: semImage.naturalHeight * imageViewProp.magnification,
		};

		divRef.current.style.width = `${size.width.toString()}px`;
		divRef.current.style.height = `${size.height.toString()}px`;
		overlay.overlay.imgRef.current.width = semImage.width;
		overlay.overlay.imgRef.current.height = semImage.height;
		if (imageViewProp.magnification < 1.0) {
			semImageRef.current.className = classes.auto;
		} else {
			semImageRef.current.className = classes.pixelated;
		}

		// Overlay画像のResize処理
		if (overlay.overlay.GetComplete()) {
			overlay.Resize(imageViewProp.magnification);
		}

		setViewWH(
			Math.min(
				panelRef.current.offsetWidth / imageViewProp.magnification,
				semImageRef.current.naturalWidth,
			),
			Math.min(
				panelRef.current.offsetHeight / imageViewProp.magnification,
				semImageRef.current.naturalHeight,
			),
		);
	}, [overlay, imageViewProp.magnification, setViewWH]);

	// // 画像ロード後イベントハンドラー
	const onLoadImage: React.ReactEventHandler<HTMLImageElement> = () => {
		overlay.Reload();
		Resize();
		updateSFOVDispInfo();
		if (semImageRef.current?.complete ?? false) {
			setMagnification(0.2);
		}
	};

	// 更新処理
	useEffect(() => {
		const sem = semImageRef.current;
		if (sem == null || !sem.complete) {
			return;
		}
		Resize();
	}, [Resize]);

	useLayoutEffect(() => {
		if (semImageRef.current == null || panelRef.current == null) return;
		const sx = clamp(scroll.x, 0, semImageRef.current.width);
		const sy = clamp(scroll.y, 0, semImageRef.current.height);
		panelRef.current.scrollTo(sx, sy);
	}, [scroll.x, scroll.y]);

	// マウスホイールのイベントリスナ本体
	const wheelHandler = (e: WheelEvent): void => {
		if (panelRef.current == null) return;
		e.preventDefault(); // スクロールさせない
		// もともとの座標などを保持しておく
		const prevScroll = {
			x: panelRef.current.scrollLeft,
			y: panelRef.current.scrollTop,
		};
		const prevMag = imageViewProp.magnification;
		const semPx = { x: e.offsetX, y: e.offsetY };
		const dispPx = { x: semPx.x - prevScroll.x, y: semPx.y - prevScroll.y };

		const mag =
			imageViewProp.magnification *
			(e.deltaY < 0 ? wheelZoomRatio : 1 / wheelZoomRatio);
		const newMag = clamp(mag, minMagnification, maxMagnification);
		setMagnification(newMag);
		updateSFOVDispInfo();

		const newScrollX = (semPx.x * newMag) / prevMag - dispPx.x;
		const newScrollY = (semPx.y * newMag) / prevMag - dispPx.y;

		setScroll({ x: newScrollX, y: newScrollY, smooth: false });
	};

	// canvasにマウス関連のイベントリスナを追加
	// wheelイベントはデフォルトの挙動を防ぐ(preventDefaultする)ためにpassive:falseを指定している
	useEffect(() => {
		if (divRef.current == null) return;
		const divElem = divRef.current;
		divElem.addEventListener("wheel", wheelHandler, { passive: false });

		divElem.addEventListener("mousedown", mousedownHandler);
		divElem.addEventListener("mouseup", mouseupHandler);
		const isdown = mousescrollstate.isdown;
		if (isdown) {
			// ボタンが押されていない状態ではmousemoveを捕捉する必要なし
			divElem.addEventListener("mousemove", mousemoveHandler);
		}

		return () => {
			divElem.removeEventListener("wheel", wheelHandler);
			divElem.removeEventListener("mousedown", mousedownHandler);
			divElem.removeEventListener("mouseup", mouseupHandler);
			if (isdown) {
				divElem.removeEventListener("mousemove", mousemoveHandler);
			}
		};
	});

	const mousedownHandler = (ev: MouseEvent): void => {
		if (ev.button !== 0) return; // 主ボタン(左クリック)以外は無視
		if (panelRef.current == null) return;
		const sc = {
			x: panelRef.current.scrollLeft,
			y: panelRef.current.scrollTop,
		};
		setmousescrollstate({
			isdown: true,
			mouse_x: ev.screenX,
			mouse_y: ev.screenY,
			scroll_x: sc.x,
			scroll_y: sc.y,
		});
	};

	const mouseupHandler = (ev: MouseEvent): void => {
		if (ev.button !== 0) return;
		setmousescrollstate({
			isdown: false,
			mouse_x: 0,
			mouse_y: 0,
			scroll_x: 0,
			scroll_y: 0,
		});
	};

	const mousemoveHandler = (ev: MouseEvent): void => {
		const sx =
			mousescrollstate.scroll_x + (mousescrollstate.mouse_x - ev.screenX);
		const sy =
			mousescrollstate.scroll_y + (mousescrollstate.mouse_y - ev.screenY);
		setScroll({ x: sx, y: sy, smooth: false });
	};

	const updateSFOVDispInfo = useCallback((): void => {
		if (
			panelRef.current == null ||
			semImageRef.current == null ||
			!semImageRef.current.complete
		) {
			return;
		}

		const sc = {
			x: panelRef.current.scrollLeft,
			y: panelRef.current.scrollTop,
		};
		const scMax = {
			x: panelRef.current.scrollWidth,
			y: panelRef.current.scrollHeight,
		};
		const naturalPw = imageViewProp.viewW;
		const naturalPh = imageViewProp.viewH;

		let centerX = semImageRef.current.naturalWidth / 2;
		if (scMax.x !== 0) {
			centerX =
				naturalPw / 2 +
				(semImageRef.current.naturalWidth - naturalPw) * (sc.x / scMax.x);
		}

		let centerY = semImageRef.current.naturalHeight / 2;
		if (scMax.y !== 0) {
			centerY =
				naturalPh / 2 +
				(semImageRef.current.naturalHeight - naturalPh) * (sc.y / scMax.y);
		}

		setCenterXY(centerX, centerY);
	}, [imageViewProp.viewH, imageViewProp.viewW, setCenterXY]);

	// // scroll時表示情報更新処理の設定
	useEffect(() => {
		if (panelRef.current == null) return;

		updateSFOVDispInfo();

		if (
			window.getComputedStyle(panelRef.current).overflowY === "hidden" &&
			window.getComputedStyle(panelRef.current).overflowX === "hidden"
		)
			return;

		const panelElem = panelRef.current;
		panelElem.addEventListener("scroll", updateSFOVDispInfo);
		return () => {
			panelElem.removeEventListener("scroll", updateSFOVDispInfo);
		};
	});

	return (
		<Box
			sx={{ height: "calc(100% - 48px)", width: "100%", overflow: "auto" }}
			ref={panelRef}
			flex={1}
		>
			<div style={{ height: "100%", width: "100%", position: "relative" }}>
				<div
					ref={divRef}
					style={{
						height: "100%",
						width: "100%",
						backgroundColor: "black",
						position: "absolute",
					}}
				>
					<img
						ref={semImageRef}
						alt="image not found"
						className={classes.pixelated}
						src={`${DOMAIN_API}/models/${model}/${selectedFov?.resultNo ?? 1}-${selectedFov?.areaNo ?? 1}-${selectedFov?.mfovNo ?? 1}-${selectedFov?.sfovNo ?? 1}-sem.bmp`}
						style={{
							position: "absolute",
							zIndex: 1,
							pointerEvents: "none",
						}}
						onLoad={onLoadImage}
					/>
					<img
						className={classes.pixelated}
						ref={overlay.overlay.imgRef}
						src={`${DOMAIN_API}/models/${model}/${selectedFov?.resultNo ?? 1}-${selectedFov?.areaNo ?? 1}-${selectedFov?.mfovNo ?? 1}-${selectedFov?.sfovNo ?? 1}-segmentation.png`}
						hidden={isHiddenSegmentation}
						style={{
							height: "100%",
							width: "100%",
							position: "absolute",
							opacity: segmentationOpacity,
							zIndex: 2,
							pointerEvents: "none",
						}}
						onLoad={onLoadImage}
					/>
				</div>
			</div>
		</Box>
	);
};
