import CrossIcon from "@mui/icons-material/Add";
import Tooltip from "@mui/material/Tooltip";
import type { Size } from "~/features/misc/types";
import { useSFov } from "../hooks/useSFov";

const CROSS_ICON_SIZE = 50;

interface CrossProp {
	semSize: Size;
	top: number;
	left: number;
	scale: number;
	zIndex: number;
}

export const Cross = ({
	semSize,
	top,
	left,
	scale,
	zIndex,
}: CrossProp): JSX.Element => {
	const { sFovX, sFovY, isSpecifiedCoordInSFov, getSpecifiedCoordForCanvas } =
		useSFov();
	// 1.Crossボタンが非活性
	// 2.SEMイメージが生成されていない
	// 上記いずれかの場合、Addアイコンを表示しない
	if (!isSpecifiedCoordInSFov || !semSize.width || !semSize.height) {
		return <></>;
	}

	// 指定Chip内座標の sFov内座標取得
	const crossPosition = getSpecifiedCoordForCanvas(semSize);

	// 十字マーク表示位置(top-left)を sFovViewの位置/拡大率に合わせて調整
	const crossTop = top + crossPosition.top * scale - CROSS_ICON_SIZE / 2;
	const crossLeft = left + crossPosition.left * scale - CROSS_ICON_SIZE / 2;

	return (
		/* 指定座標をツールチップで表示 */
		<Tooltip title={`${sFovX}, ${sFovY}`} arrow>
			<div
				style={{
					position: "absolute",
					top: crossTop,
					left: crossLeft,
					width: `${CROSS_ICON_SIZE}px`,
					height: `${CROSS_ICON_SIZE}px`,
					zIndex: zIndex,
				}}
			>
				<CrossIcon
					sx={{
						width: `${CROSS_ICON_SIZE}px`,
						height: `${CROSS_ICON_SIZE}px`,
						color: "lime",
					}}
				/>
			</div>
		</Tooltip>
	);
};
