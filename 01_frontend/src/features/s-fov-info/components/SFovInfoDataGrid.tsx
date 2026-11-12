import { Box } from "@mui/material";
import { StyledTable, type StyledTableInfo } from "~/components/elements";
import { useImageInfo } from "~/features/info-and-defect/hooks/useImageInfo";
import { useSFovInfo } from "../hooks/useSFovInfo";
const rowHeight = 18;
// テーブルコンポーネント全体の高さは、10行分の高さ + padding上下分 + ２行分の border分
const tableHeight = 12 * (rowHeight + 12) + 2;

export const SFovInfoDataGrid = (): JSX.Element => {
	const fov = useSFovInfo();
	const { imageInfoList } = useImageInfo();

	if (fov == null) {
		return (
			<Box
				sx={{
					height: tableHeight,
					overflow: "auto",
				}}
			>
				<StyledTable dataList={[]} rowHeight={rowHeight} padding="6px 4px" />
			</Box>
		);
	}

	const fovX = imageInfoList.length < 2 ? "" : imageInfoList[0].value;
	const fovY = imageInfoList.length < 2 ? "" : imageInfoList[1].value;
	const sFovAdditionalInfoTable: StyledTableInfo[] = [
		{ item: "Chip (x, y)", value: `${fov.chipX}, ${fov.chipY}` },
		{ item: "mFOV No.", value: fov.mfovNo },
		{ item: "sFOV No.", value: fov.sfovNo },
		{ item: "Seq No.", value: fov.seqNo },
		{ item: "Area No.", value: fov.areaNo },
		{ item: "FOV X [um]", value: fovX },
		{ item: "FOV Y [um]", value: fovY },
		{ item: "Pixel Size [nm/pixel]", value: fov.pixelSize },
		{ item: "Scan Mode", value: fov.scanMode },
		{ item: "Frame", value: fov.frame },
		{ item: "CoordX [nm]", value: fov.sfovX.toLocaleString() },
		{ item: "CoordY [nm]", value: fov.sfovY.toLocaleString() },
	];
	return (
		<Box
			sx={{
				height: tableHeight,
				overflow: "auto",
			}}
		>
			<StyledTable
				dataList={sFovAdditionalInfoTable}
				rowHeight={rowHeight}
				padding="6px 4px"
			/>
		</Box>
	);
};
