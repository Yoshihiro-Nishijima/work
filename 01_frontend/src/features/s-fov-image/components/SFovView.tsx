import { Box } from "@mui/material";
import { useCallback, useEffect, useRef, useState } from "react";

import { MagnificationSlider } from "~/components/elements/MagnificationSlider";
import { Toast } from "~/components/elements/Toast";
import type { DefectRecord } from "~/features/defect-list/types";
import {
	calcDefectCenterPoint,
	useDefect,
} from "~/features/info-and-defect/hooks/useDefect";
import { Cross } from "~/features/integrated-viewer-map/components/Cross";
import { useSFovViewModal } from "~/features/integrated-viewer-sfov-view/hooks/useSFovViewModal";
import { useIdw } from "~/features/map/hooks";
import { useImageViewProp } from "~/features/misc/hooks/useImageViewProp";
import { useSelectedChipValue } from "~/features/misc/hooks/useMapSelectionStatus";
import { useResultName } from "~/features/misc/hooks/useResultName";
import type { Position } from "~/features/misc/types";
import { ReviewControlButtons } from "~/features/training-mode-sfov-view/components/ReviewControlButtons";
import { useReviewModal } from "~/features/training-mode-sfov-view/hooks/useReviewModal";
import { MAX_SCALE, MIN_SCALE, useSFovView } from "../hooks/useSFovView";
import { OverlayImage } from "./OverlayImage";
import { Roi } from "./Roi";
import { SEMImage } from "./SEMImage";

// ホイール操作時のズーム増減率
const ZOOM_RATIO = 1.1;

interface SEMImageProp {
	mfovno?: number;
	sfovno?: number;
	testRunId?: string;
	testRunProcessedCount?: number;
}

export const SFovView = ({
	mfovno = 0,
	sfovno = 0,
	testRunId = "",
	testRunProcessedCount = 0,
}: SEMImageProp): JSX.Element => {
	// 画像表示用コンテナ要素参照
	const containerRef = useRef<HTMLDivElement>(null);

	const { resultName, toolData } = useResultName();
	const { imageViewProp } = useImageViewProp();

	const { idw, getSFovSize } = useIdw();
	const { isSFovViewModalOpen } = useSFovViewModal();
	const { isReviewModalOpen } = useReviewModal();

	const { selectedDefect } = useDefect();

	// ### リサイズ/パン操作用
	const {
		scale,
		position,
		containerSize,
		sFovSize,
		setContainerRef,
		setContainerSize,
		setSFovSize,
		updateScaleAndPosition,
		setPosition,
	} = useSFovView();
	const [isDragging, setIsDragging] = useState(false);
	const [dragStart, setDragStart] = useState<Position>({ top: 0, left: 0 });

	const selectedChip = useSelectedChipValue();

	// 最新値を保持するための ref
	// イベントハンドラ内で最新のstateを参照するために使用
	const scaleRef = useRef(scale);
	const positionRef = useRef(position);
	const containerSizeRef = useRef(containerSize);
	useEffect(() => {
		scaleRef.current = scale;
	}, [scale]);

	// TODO 現状、画像データとidwデータが不一致なので、ひとまず画像データを使うようにする
	// idwのほうを使う場合は、下記のコメントアウトを外してSEMImage.tsxの onloadイベント周りを無くすこと

	// idw から sFovSizeを取得
	// 呼び出し側で SelectedChipを設定済みにしておくこと
	// useEffect(() => {
	// 	const sFovSize = getSFovSize(selectedChip.x, selectedChip.y);
	// 	if (sFovSize == null) return;
	// 	setSFovSize({ width: sFovSize.x, height: sFovSize.y });
	// }, [getSFovSize, selectedChip, setSFovSize]);

	useEffect(() => {
		positionRef.current = position;
	}, [position]);

	useEffect(() => {
		containerSizeRef.current = containerSize;
	}, [containerSize]);

	// エラートースト表示用
	const [offsetErrMsg, setOffsetErrMsg] = useState<string | undefined>(
		undefined,
	);

	useEffect(() => {
		setContainerRef(containerRef);
	}, [setContainerRef]);

	// defect座標をSFov position(top-left)に変換
	const calcDefectCenterPosition = useCallback(
		(defect: DefectRecord, scale: number): Position => {
			const defectCenter = calcDefectCenterPoint(defect);
			return {
				top: containerSizeRef.current.height / 2 - defectCenter.y * scale,
				left: containerSizeRef.current.width / 2 - defectCenter.x * scale,
			};
		},
		[],
	);

	useEffect(() => {
		if (selectedDefect == null) return;

		setPosition(calcDefectCenterPosition(selectedDefect, scaleRef.current));
	}, [selectedDefect, setPosition, calcDefectCenterPosition]);

	// canvasにマウスホイール操作イベントリスナを追加
	// デフォルトの挙動を防ぐにはpassive:falseを指定する必要があるため明示的に追加
	useEffect(() => {
		if (containerRef?.current == null) return;
		const container = containerRef.current;

		const handleWheel = (e: WheelEvent): void => {
			e.preventDefault();
			const rect = container.getBoundingClientRect();
			const mouseX = e.clientX - rect.left;
			const mouseY = e.clientY - rect.top;
			const delta = e.deltaY < 0 ? ZOOM_RATIO : 1 / ZOOM_RATIO;
			const targetScale = scaleRef.current * delta;
			updateScaleAndPosition(targetScale, mouseX, mouseY);
		};
		container.addEventListener("wheel", handleWheel, { passive: false });
		return () => container.removeEventListener("wheel", handleWheel);
	}, [updateScaleAndPosition]);

	const handleMouseUp = useCallback((e: React.MouseEvent): void => {
		if (e.button !== 0) return;
		setIsDragging(false);
	}, []);

	const handleMouseDown = useCallback((e: React.MouseEvent): void => {
		// 主ボタン(左クリック)以外は無視
		if (e.button !== 0) return;
		setIsDragging(true);
		setDragStart({
			top: e.clientY - positionRef.current.top,
			left: e.clientX - positionRef.current.left,
		});
	}, []);

	const handleMouseMove = useCallback(
		(e: React.MouseEvent): void => {
			if (!isDragging) return;
			setPosition({
				top: e.clientY - dragStart.top,
				left: e.clientX - dragStart.left,
			});
		},
		[isDragging, dragStart, setPosition],
	);

	// リサイズ時のコンテナサイズ更新
	useEffect(() => {
		const updateContainerSizeCallback = () => {
			if (containerRef.current == null) return;

			const rect = containerRef.current.getBoundingClientRect();
			if (
				rect.width !== containerSizeRef.current.width ||
				rect.height !== containerSizeRef.current.height
			) {
				setContainerSize({ width: rect.width, height: rect.height });
			}
		};
		updateContainerSizeCallback();
		const currentContainer = containerRef.current;
		const resizeObserver = new ResizeObserver(updateContainerSizeCallback);
		if (currentContainer) {
			resizeObserver.observe(currentContainer);
		}
		return () => {
			if (currentContainer) {
				resizeObserver.unobserve(currentContainer);
			}
		};
	}, [setContainerSize]);

	const handleOnloadSEMImage = (width: number, height: number): void => {
		setSFovSize({ width, height });
	};

	// TODO スケール表示とスライダーは別コンポーネントが良いかな？
	function semScale(
		nmPerPixel: number | undefined,
		magnification: number,
	): JSX.Element {
		if (containerRef?.current == null || nmPerPixel == null) {
			return <></>;
		}

		const nmpx = nmPerPixel / magnification;
		const nm = 200 * nmpx; // バーの長さが200pxになる寸法
		const round = 10 ** Math.floor(Math.log10(nm)); // 丸めるときの桁
		const nmRound = Math.floor(nm / round) * round; // 寸法を丸める

		/** nmRoundの一番上の数値を1,2,5のどれかに変換する */
		/** 桁数を計算 */
		const digitCount = Math.floor(Math.log10(nmRound)) + 1;
		const convStr = nmRound.toString();
		/** 先頭の数値を取得 */
		const firstDigit = convStr.match(/[1-9]/)?.[0];
		const convNum = Number(firstDigit);
		/** 1桁目から1,2,5,10のいずれかの数字に変換 */
		const convertFstDisgit =
			convNum >= 7 ? 10 : convNum >= 4 ? 5 : convNum >= 2 ? 2 : 1;
		/** 変換した値を変換前の桁数に戻す */
		const convertedValue = convertFstDisgit * 10 ** (digitCount - 1);
		/** バーの長さを補正 */
		const barLength = convertedValue / nmpx;

		// SFovView画面表示中以外とSFovView画面表示中で表示位置を調整
		const bottom = !isSFovViewModalOpen ? "5%" : "7%";
		const right = !isSFovViewModalOpen ? "50%" : "10%";

		return (
			<Box
				sx={{
					position: "absolute",
					right: { right },
					bottom: { bottom },
					background: "rgba(0, 0, 0, 0.5)",
					color: "white",
					textAlign: "center",
					borderRadius: "5px",
					padding: "7px",
					zIndex: 15,
					pointerEvents: "none",
				}}
				className="semscale"
			>
				<div
					style={{
						borderBottom: "solid white 3px",
						verticalAlign: "middle",
						width: `${barLength}px`,
						height: "0px",
					}}
				/>
				<b>{convertedValue}nm</b>
			</Box>
		);
	}

	function semSlider(): JSX.Element {
		const handleChangeSemSlider = (
			_: Event,
			newValue: number | number[],
		): void => {
			updateScaleAndPosition(
				Math.E ** (Array.isArray(newValue) ? newValue[0] : newValue),
			);
		};
		// +ボタンクリック時のイベント
		const handleOnCkickSemSliderAdd = (
			_: React.MouseEvent<HTMLElement, MouseEvent>,
		): void => {
			const currentScale = scale;
			const newScale = currentScale * ZOOM_RATIO;
			if (currentScale >= MAX_SCALE) return;
			if (newScale > MAX_SCALE) {
				// 上限を超える場合は上限値を設定
				updateScaleAndPosition(MAX_SCALE);
				return;
			}
			updateScaleAndPosition(newScale);
		};
		// -ボタンクリック時のイベント
		const handleOnCkickSemSliderRemove = (
			_: React.MouseEvent<HTMLElement, MouseEvent>,
		): void => {
			const currentScale = scale;
			if (currentScale <= MIN_SCALE) return;
			const newScale = currentScale / ZOOM_RATIO;
			if (newScale < MIN_SCALE) {
				// 下限未満になる場合は下限値を設定
				updateScaleAndPosition(MIN_SCALE);
				return;
			}
			updateScaleAndPosition(newScale);
		};

		const semsliderSx = { zIndex: 15 };
		return (
			<MagnificationSlider
				// パーセント表示するため、displayValueFactorは100を設定
				sx={semsliderSx}
				maxValue={Math.log(MAX_SCALE)}
				minValue={Math.log(MIN_SCALE)}
				increment={(Math.log(MAX_SCALE) - Math.log(MIN_SCALE)) / 100}
				magnification={Math.log(scale)}
				displayValueFactor={1}
				handleChangeSliderEvent={handleChangeSemSlider}
				handleOnClickAddEvent={handleOnCkickSemSliderAdd}
				handleOnClickRemoveEvent={handleOnCkickSemSliderRemove}
			/>
		);
	}

	const calcToastPosition = useCallback(() => {
		// エラートースト表示位置調整
		const refBound = containerRef.current?.getBoundingClientRect();
		return {
			top: `${(refBound?.top ?? 0) + 10}px`,
			left: `${refBound?.left ?? 0}px`,
		};
	}, []);

	return (
		<Box
			sx={{ height: "calc(100% - 48px)", width: "100%", overflow: "auto" }}
			flex={1}
		>
			<div
				ref={containerRef}
				style={{
					height: "100%",
					width: "100%",
					overflow: "hidden",
					position: "relative",
				}}
				onMouseDown={handleMouseDown}
				onMouseMove={handleMouseMove}
				onMouseUp={handleMouseUp}
				onMouseLeave={handleMouseUp}
			>
				{/* ズーム操作対象 Div要素 */}
				<div
					style={{
						height: sFovSize.height,
						width: sFovSize.width,
						backgroundColor: "black",
						position: "absolute",
						transform: `translate(${position.left}px, ${position.top}px) scale(${scale})`,
						transformOrigin: "0 0",
						userSelect: "none",
					}}
				>
					{mfovno === 0 || sfovno === 0 ? (
						<></>
					) : (
						<>
							<SEMImage
								resultName={resultName}
								toolData={toolData}
								mfovno={mfovno}
								sfovno={sfovno}
								testRunId={testRunId}
								testRunProcessedCount={testRunProcessedCount}
								onload={handleOnloadSEMImage}
								setErrorMsg={setOffsetErrMsg}
								zIndex={2}
							/>
							<OverlayImage
								resultName={resultName}
								mFovNo={mfovno}
								sFovNo={sfovno}
								testRunId={testRunId}
								testRunProcessedCount={testRunProcessedCount}
								defectIndex={4}
								boxSegmentIndex={6}
								designIndex={10}
							/>
						</>
					)}
					{/* TODO DefectFilter情報(内容不明) */}
				</div>
				{/* 以降のコンポーネントは拡大率に関わらず同じサイズで表示する必要があるので transformの範囲外とする */}
				<Roi
					top={position.top}
					left={position.left}
					width={sFovSize.width}
					height={sFovSize.height}
					scale={scale}
					zIndex={12}
				/>
				{imageViewProp.showCrossData && (
					<Cross
						semSize={sFovSize}
						top={position.top}
						left={position.left}
						scale={scale}
						zIndex={11}
					/>
				)}
				{/* Toastは拡大率に関わらず同じサイズで表示する必要があるので transformの範囲外 */}
				<Toast
					message={offsetErrMsg ?? ""}
					trigger={{
						isOpen: offsetErrMsg != null,
						onClose: () => setOffsetErrMsg(undefined),
					}}
					anchorOrigin={{ vertical: "top", horizontal: "left" }}
					severity={offsetErrMsg != null ? "error" : "success"}
					displayPosition={calcToastPosition()}
				/>
			</div>
			{(imageViewProp.showScale || isSFovViewModalOpen) &&
				semScale(
					idw != null ? idw.inspectionArea[0].pixSize : undefined,
					scale,
				)}
			{isReviewModalOpen && <ReviewControlButtons />}
			{isSFovViewModalOpen && semSlider()}
		</Box>
	);
};
