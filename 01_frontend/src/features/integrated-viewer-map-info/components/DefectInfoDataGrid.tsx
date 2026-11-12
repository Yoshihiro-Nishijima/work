import { Box } from "@mui/material";
import { StyledTable, type StyledTableInfo } from "~/components/elements";
import { useSelectedDefect } from "~/features/misc/hooks/useSelectedDefect";
import { useSFovInfo } from "~/features/s-fov-info/hooks/useSFovInfo";

const rowHeight = 18;
// テーブルコンポーネント全体の高さは、12行分の高さ + padding上下分 + ２行分の border分
// ＋ Coordinate項目名の改行分
const tableHeight = 15 * (rowHeight + 12) + 2;

export const DefectInfoDataGrid = (): JSX.Element => {
	const { selectedDefect: defect } = useSelectedDefect();
	const fov = useSFovInfo();

	if (defect == null) {
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

	const defectAdditionalInfoTable: StyledTableInfo[] = [
		{ item: "DefectID", value: defect.defectId },
		{ item: "Abnormality", value: defect.abnormality },
		{ item: "Class No.", value: defect.defectClass },
		{ item: "Gray [0-255]", value: defect.gray },
		{ item: "Gray Diff", value: defect.grayDiff },
		{ item: "Height [nm]", value: defect.height },
		{ item: "Width [nm]", value: defect.width },
		{ item: "Layer", value: defect.layers.join(",") },
		{ item: "CoordinateX [nm]", value: defect.coordX.toLocaleString() },
		{ item: "CoordinateY [nm]", value: defect.coordY.toLocaleString() },
		{ item: "Chip (x, y)", value: `${defect.chipX}, ${defect.chipY}` },
		{ item: "mFOV No.", value: defect.mFOVno },
		{ item: "sFOV No.", value: defect.sFOVno },
		{ item: "sFOV CoordX [nm]", value: fov?.sfovX.toLocaleString() ?? "" },
		{ item: "sFOV CoordY [nm]", value: fov?.sfovY.toLocaleString() ?? "" },
	];
	return (
		<Box
			sx={{
				height: tableHeight,
				overflow: "auto",
			}}
		>
			<StyledTable
				dataList={defectAdditionalInfoTable}
				rowHeight={rowHeight}
				padding="6px 4px"
			/>
		</Box>
	);
};
