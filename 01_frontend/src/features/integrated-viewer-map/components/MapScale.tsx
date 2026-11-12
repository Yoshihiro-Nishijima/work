import { Box } from "@mui/system";

import { useIdw } from "~/features/map/hooks";
import { useMapAreaInfo } from "../hooks/useMapAreaInfo";
import { useMapInfo } from "../hooks/useMapInfo";
import { SCALE_SLIDER_BOTTOM_HEIGHT } from "./MapSlider";

/** スケールの単位をmm表示する範囲の倍率 */
const DISP_MILLI_MAGNIFICATION = 51;
/** mm→µmに変換する際の係数 */
const ONE_TENTH_MICRO_COEFFICOENT = 1000;

/** SFovView画面表示中以外とSFovView画面表示中で表示位置を調整 */
const bottom = `${SCALE_SLIDER_BOTTOM_HEIGHT}px`;
const right = "100px";

/**
 * Map Scale表示
 * @returns MapScaleコンポーネント
 */
export function MapScale(): JSX.Element {
	const { idw } = useIdw();
	const { scale } = useMapInfo();
	const { integratedMapAreaHeight } = useMapAreaInfo();

	const nmPerPixel = idw?.inspectionArea[0].pixSize;
	if (nmPerPixel == null) return <></>;

	/** nmPerPixelを倍率で割ることで表示倍率の値に補正 */
	const correctNmPerPx = nmPerPixel / scale;
	/** 基準値として使用、nmPerPixel=2の時1chipの長さが20mmとなるように補正係数20をかける */
	const baseValue = 20 * correctNmPerPx;
	/** baseValueの一番上の数値を1,2,5のどれかに変換する */
	/** 桁数を計算 */
	const digitCount = Math.floor(Math.log10(baseValue)) + 1;
	const convStr = baseValue.toString();
	/** 先頭の数値を取得 */
	const firstDigit = convStr.match(/[1-9]/)?.[0];
	const convNum = Number(firstDigit);
	/** 1桁目から1,2,5,10のいずれかの数字に変換 */
	const convertFstDisgit =
		convNum >= 7 ? 10 : convNum >= 4 ? 5 : convNum >= 2 ? 2 : 1;

	/** 変換した値を変換前の桁数に戻す */
	const convertedMicronValue = convertFstDisgit * 10 ** (digitCount - 1);
	/** 1倍表示の時にミクロンバーの長さが2chip分の長さになるようにバーを補正する */
	/** 1920×1080表示時にバーの長さ6倍で120px、MapArea高さが998pxになる。 */
	const barCorrectionFactor = (6 / 998) * integratedMapAreaHeight;
	/** バーの長さを補正 */
	const barLength =
		(convertedMicronValue / correctNmPerPx) * barCorrectionFactor;

	/** スケール調整(1桁になった段階で単位切替) */
	/** 1chip=20mm(300mm/15) 1mFOV=116um 1sFOV=10.5um(116um/11) */
	const dispNm =
		scale < DISP_MILLI_MAGNIFICATION
			? `${convertedMicronValue}mm`
			: `${Math.round(convertedMicronValue * ONE_TENTH_MICRO_COEFFICOENT)}um`;

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
			<b>{dispNm}</b>
		</Box>
	);
}
